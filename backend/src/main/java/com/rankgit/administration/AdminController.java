package com.rankgit.administration;

import com.rankgit.administration.dto.AddDeveloperRequest;
import com.rankgit.administration.dto.AdminUserCreateRequest;
import com.rankgit.administration.dto.AdminUserUpdateRequest;
import com.rankgit.administration.dto.AdminUsersPageResponse;
import com.rankgit.administration.dto.SyncSummaryDto;
import com.rankgit.auth.dto.UserProfileDto;
import com.rankgit.ranking.TrackedDeveloper;
import com.rankgit.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(AdminService adminService, UserService userService, PasswordEncoder passwordEncoder) {
        this.adminService = adminService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/developers")
    public ResponseEntity<TrackedDeveloper> addDeveloper(
            @Valid @RequestBody AddDeveloperRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String adminUsername = userDetails != null ? userDetails.getUsername() : "admin";
        TrackedDeveloper saved = adminService.addDeveloperByLink(request.githubInput(), adminUsername);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/sync")
    public ResponseEntity<SyncSummaryDto> syncAll() {
        SyncSummaryDto summary = adminService.syncAllDevelopers();
        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/developers/{id}")
    public ResponseEntity<Void> deleteDeveloper(@PathVariable Long id) {
        adminService.deleteDeveloper(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // CRUD de Usuários do Sistema (Admin)
    // ==========================================

    @GetMapping("/users")
    public ResponseEntity<AdminUsersPageResponse> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(userService.listUsersPaged(page, size));
    }

    @PostMapping("/users")
    public ResponseEntity<UserProfileDto> createUser(@Valid @RequestBody AdminUserCreateRequest request) {
        UserProfileDto created = userService.adminCreateUser(request, passwordEncoder);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserProfileDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserUpdateRequest request
    ) {
        UserProfileDto updated = userService.adminUpdateUser(id, request, passwordEncoder);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/users/{id}/toggle-approval")
    public ResponseEntity<UserProfileDto> toggleUserApproval(@PathVariable Long id) {
        UserProfileDto updated = userService.adminToggleApproval(id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String adminUsername = userDetails != null ? userDetails.getUsername() : "";
        userService.adminDeleteUser(id, adminUsername);
        return ResponseEntity.noContent().build();
    }
}
