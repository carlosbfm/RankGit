package com.rankgit.user;

import com.rankgit.administration.dto.AdminUserCreateRequest;
import com.rankgit.administration.dto.AdminUserUpdateRequest;
import com.rankgit.administration.dto.AdminUsersPageResponse;
import com.rankgit.auth.dto.UserProfileDto;
import com.rankgit.common.exception.BusinessException;
import com.rankgit.common.exception.ResourceNotFoundException;
import com.rankgit.github.GitHubApiClient;
import com.rankgit.github.dto.GitHubUserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final GitHubApiClient gitHubApiClient;

    @Value("${app.github.initial-admin-username:carlosbfm}")
    private String initialAdminUsername;

    public UserService(UserRepository userRepository, GitHubApiClient gitHubApiClient) {
        this.userRepository = userRepository;
        this.gitHubApiClient = gitHubApiClient;
    }

    public Optional<User> findByGithubId(String githubId) {
        return userRepository.findByGithubId(githubId);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsernameIgnoreCase(username);
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
    }

    @Transactional
    public User register(String username, String rawPassword, String name, String email, PasswordEncoder passwordEncoder) {
        if (username == null || username.trim().isEmpty()) {
            throw new BusinessException("O nome de usuário é obrigatório.");
        }
        if (rawPassword == null || rawPassword.trim().length() < 4) {
            throw new BusinessException("A senha deve ter pelo menos 4 caracteres.");
        }

        String cleanUsername = username.trim().toLowerCase();
        if (userRepository.findByUsernameIgnoreCase(cleanUsername).isPresent()) {
            throw new BusinessException("O nome de usuário '" + cleanUsername + "' já está em uso.");
        }

        boolean makeAdmin = !userRepository.existsByRole(Role.ROLE_ADMIN) ||
                cleanUsername.equalsIgnoreCase(initialAdminUsername);

        String displayName = (name != null && !name.trim().isEmpty()) ? name.trim() : cleanUsername;
        String avatarUrl = "https://ui-avatars.com/api/?name=" + cleanUsername + "&background=0D1117&color=58A6FF&bold=true";

        User newUser = User.createWithPassword(
                cleanUsername,
                passwordEncoder.encode(rawPassword),
                displayName,
                email != null ? email.trim() : null,
                avatarUrl,
                makeAdmin ? Role.ROLE_ADMIN : Role.ROLE_USER
        );
        newUser.setApproved(makeAdmin);

        return userRepository.save(newUser);
    }

    public User authenticate(String username, String rawPassword, PasswordEncoder passwordEncoder) {
        if (username == null || rawPassword == null) {
            throw new BusinessException("Usuário e senha são obrigatórios.");
        }

        User user = userRepository.findByUsernameIgnoreCase(username.trim())
                .orElseThrow(() -> new BusinessException("Usuário ou senha inválidos."));

        // Se for o admin inicial e a senha ainda não foi gravada, inicializa com senha padrão segura
        if (user.getPassword() == null && user.getUsername().equalsIgnoreCase(initialAdminUsername)) {
            if ("admin123".equals(rawPassword)) {
                user.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(user);
            }
        }

        if (user.getPassword() == null || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new BusinessException("Usuário ou senha inválidos.");
        }

        if (!user.isApproved()) {
            throw new BusinessException("Sua conta foi criada, mas está aguardando aprovação de um administrador.");
        }

        return user;
    }

    @Transactional
    public User processOAuthUser(String githubId, String username, String name, String email, String avatarUrl) {
        return userRepository.findByGithubId(githubId)
                .or(() -> userRepository.findByUsernameIgnoreCase(username))
                .map(existingUser -> {
                    existingUser.setGithubId(githubId);
                    existingUser.setUsername(username);
                    if (name != null) existingUser.setName(name);
                    if (email != null) existingUser.setEmail(email);
                    if (avatarUrl != null) existingUser.setAvatarUrl(avatarUrl);

                    // Verifica se o usuário atual é o admin inicial configurado
                    if (username.equalsIgnoreCase(initialAdminUsername)) {
                        existingUser.setRole(Role.ROLE_ADMIN);
                        existingUser.setApproved(true);
                    }
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // Primeiro usuário no sistema ou usuário correspondente ao initialAdminUsername ganha ROLE_ADMIN
                    boolean makeAdmin = !userRepository.existsByRole(Role.ROLE_ADMIN) ||
                            username.equalsIgnoreCase(initialAdminUsername);

                    User newUser = new User(
                            githubId,
                            username,
                            name != null ? name : username,
                            email,
                            avatarUrl,
                            makeAdmin ? Role.ROLE_ADMIN : Role.ROLE_USER
                    );
                    newUser.setApproved(makeAdmin);
                    return userRepository.save(newUser);
                });
    }

    @Transactional
    public User loginOrRegisterGitHubUser(String usernameOrUrl) {
        String cleanUsername;
        GitHubUserResponse ghUser = null;
        try {
            cleanUsername = gitHubApiClient.extractUsername(usernameOrUrl);
            ghUser = gitHubApiClient.fetchUserDetails(cleanUsername);
        } catch (Exception e) {
            cleanUsername = usernameOrUrl.trim().replace("@", "");
        }

        final String finalUsername = cleanUsername;
        final GitHubUserResponse finalGhUser = ghUser;

        return userRepository.findByUsernameIgnoreCase(finalUsername)
                .map(existing -> {
                    if (finalGhUser != null) {
                        if (finalGhUser.avatarUrl() != null) existing.setAvatarUrl(finalGhUser.avatarUrl());
                        if (finalGhUser.name() != null) existing.setName(finalGhUser.name());
                        if (finalGhUser.email() != null) existing.setEmail(finalGhUser.email());
                    }
                    if (finalUsername.equalsIgnoreCase(initialAdminUsername)) {
                        existing.setRole(Role.ROLE_ADMIN);
                        existing.setApproved(true);
                    }
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    boolean makeAdmin = !userRepository.existsByRole(Role.ROLE_ADMIN) ||
                            finalUsername.equalsIgnoreCase(initialAdminUsername);

                    User newUser = new User();
                    newUser.setUsername(finalUsername);
                    newUser.setRole(makeAdmin ? Role.ROLE_ADMIN : Role.ROLE_USER);
                    newUser.setApproved(makeAdmin);

                    if (finalGhUser != null) {
                        newUser.setName(finalGhUser.name() != null ? finalGhUser.name() : finalUsername);
                        newUser.setEmail(finalGhUser.email());
                        newUser.setAvatarUrl(finalGhUser.avatarUrl() != null ? finalGhUser.avatarUrl() : "https://github.com/" + finalUsername + ".png");
                        if (finalGhUser.id() != null) {
                            newUser.setGithubId(String.valueOf(finalGhUser.id()));
                        }
                    } else {
                        newUser.setName(finalUsername);
                        newUser.setAvatarUrl("https://github.com/" + finalUsername + ".png");
                    }
                    return userRepository.save(newUser);
                });
    }

    public List<UserProfileDto> listAllUsers() {
        return userRepository.findAll().stream()
                .map(UserProfileDto::fromEntity)
                .toList();
    }

    public AdminUsersPageResponse listUsersPaged(int page, int size) {
        int validPage = Math.max(0, page);
        int validSize = Math.max(1, Math.min(100, size));
        Pageable pageable = PageRequest.of(validPage, validSize, Sort.by("id").ascending());
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserProfileDto> list = userPage.getContent().stream()
                .map(UserProfileDto::fromEntity)
                .toList();
        return new AdminUsersPageResponse(
                list,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages()
        );
    }

    @Transactional
    public UserProfileDto adminCreateUser(AdminUserCreateRequest request, PasswordEncoder passwordEncoder) {
        String cleanUsername = request.username().trim().toLowerCase();
        if (userRepository.findByUsernameIgnoreCase(cleanUsername).isPresent()) {
            throw new BusinessException("O nome de usuário '" + cleanUsername + "' já está em uso.");
        }

        Role role = request.role() != null ? request.role() : Role.ROLE_USER;
        String displayName = (request.name() != null && !request.name().trim().isEmpty())
                ? request.name().trim()
                : cleanUsername;
        String avatarUrl = "https://ui-avatars.com/api/?name=" + cleanUsername + "&background=0D1117&color=58A6FF&bold=true";

        User user = User.createWithPassword(
                cleanUsername,
                passwordEncoder.encode(request.password().trim()),
                displayName,
                request.email() != null ? request.email().trim() : null,
                avatarUrl,
                role
        );
        user.setApproved(true);

        return UserProfileDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserProfileDto adminUpdateUser(Long id, AdminUserUpdateRequest request, PasswordEncoder passwordEncoder) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));

        String cleanUsername = request.username().trim().toLowerCase();
        if (!user.getUsername().equalsIgnoreCase(cleanUsername)) {
            if (userRepository.findByUsernameIgnoreCase(cleanUsername).isPresent()) {
                throw new BusinessException("O nome de usuário '" + cleanUsername + "' já está em uso por outro usuário.");
            }
            user.setUsername(cleanUsername);
        }

        if (request.name() != null) {
            user.setName(request.name().trim());
        }
        if (request.email() != null) {
            user.setEmail(request.email().trim());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.approved() != null) {
            user.setApproved(request.approved());
        }
        if (request.password() != null && !request.password().trim().isEmpty()) {
            if (request.password().trim().length() < 4) {
                throw new BusinessException("A nova senha deve ter pelo menos 4 caracteres.");
            }
            user.setPassword(passwordEncoder.encode(request.password().trim()));
        }

        return UserProfileDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserProfileDto adminToggleApproval(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
        user.setApproved(!user.isApproved());
        return UserProfileDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void adminDeleteUser(Long id, String currentAdminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));

        if (user.getUsername().equalsIgnoreCase(currentAdminUsername)) {
            throw new BusinessException("Você não pode deletar sua própria conta de administrador em uso.");
        }

        userRepository.delete(user);
    }
}
