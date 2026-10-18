package com.example.adminservice.controller;

import com.example.adminservice.client.UserServiceClient;
import com.example.adminservice.model.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminUserController {
    private final UserServiceClient userServiceClient;

    public AdminUserController(UserServiceClient userServiceClient) {
        this.userServiceClient = userServiceClient;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return ResponseEntity.ok(ApiResponse.success(userServiceClient.getAllUsers(page, size, sort),
                "Lấy danh sách người dùng thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userServiceClient.getUserById(id),
                "Lấy thông tin người dùng thành công"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(@PathVariable UUID id,
                                                                @RequestBody Map<String, Boolean> payload) {
        if (payload.get("isActive") == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Trường 'isActive' là bắt buộc"));
        }
        userServiceClient.updateUserStatus(id, payload);
        return ResponseEntity.ok(ApiResponse.success(null,
                Boolean.TRUE.equals(payload.get("isActive")) ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công"));
    }
}