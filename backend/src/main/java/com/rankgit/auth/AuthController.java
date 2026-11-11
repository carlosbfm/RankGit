package com.rankgit.auth;

import com.rankgit.auth.dto.AuthResponse;
import com.rankgit.auth.dto.LoginRequest;
import com.rankgit.auth.dto.RegisterRequest;
import com.rankgit.auth.dto.UserProfileDto;
import com.rankgit.user.Role;
import com.rankgit.user.User;
import com.rankgit.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, JwtTokenProvider tokenProvider, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userService.findByUsername(userDetails.getUsername())
                .or(() -> userService.findByGithubId(userDetails.getUsername()))
                .or(() -> userService.findByGithubId("dev-" + userDetails.getUsername()))
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername(userDetails.getUsername());
                    u.setName(userDetails.getUsername());
                    u.setRole(userDetails.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ? Role.ROLE_ADMIN : Role.ROLE_USER);
                    return u;
                });

        return ResponseEntity.ok(UserProfileDto.fromEntity(user));
    }

    /**
     * Login tradicional por Usuário e Senha.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        User user = userService.authenticate(request.getUsername(), request.getPassword(), passwordEncoder);
        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(AuthResponse.bearer(token, UserProfileDto.fromEntity(user)));
    }

    /**
     * Cadastro de novo usuário por Usuário e Senha.
     * Caso não seja o admin inicial, a conta fica pendente de aprovação do administrador.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.register(
                request.getUsername(),
                request.getPassword(),
                request.getName(),
                request.getEmail(),
                passwordEncoder
        );
        if (!user.isApproved()) {
            return ResponseEntity.ok(AuthResponse.pendingApproval(UserProfileDto.fromEntity(user)));
        }
        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(AuthResponse.bearer(token, UserProfileDto.fromEntity(user)));
    }

    /**
     * Autenticação direta com a conta do GitHub (ex: @carlosbfm).
     */
    @PostMapping("/github")
    public ResponseEntity<AuthResponse> loginWithGitHubUsername(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, "Nome de usuário do GitHub não informado."));
        }
        User user = userService.loginOrRegisterGitHubUser(username.trim());
        if (!user.isApproved()) {
            return ResponseEntity.status(403).body(AuthResponse.pendingApproval(UserProfileDto.fromEntity(user)));
        }
        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(AuthResponse.bearer(token, UserProfileDto.fromEntity(user)));
    }

    /**
     * Endpoint conveniente para login rápido de desenvolvimento/teste local.
     */
    @PostMapping("/dev-login")
    public ResponseEntity<AuthResponse> devLogin(@RequestParam(defaultValue = "carlos") String username,
                                                 @RequestParam(defaultValue = "true") boolean asAdmin) {
        User user = userService.processOAuthUser(
                "dev-" + username,
                username,
                username.substring(0, 1).toUpperCase() + username.substring(1) + " (Dev)",
                username + "@rankgit.local",
                "https://github.com/" + username + ".png"
        );

        if (asAdmin) {
            user.setRole(Role.ROLE_ADMIN);
        }

        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(AuthResponse.bearer(token, UserProfileDto.fromEntity(user)));
    }
}
