package com.example.adminservice.controller;

import com.example.adminservice.client.ArtistServiceClient;
import com.example.adminservice.model.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/artists")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminArtistController {
    private final ArtistServiceClient artistServiceClient;

    public AdminArtistController(ArtistServiceClient artistServiceClient) {
        this.artistServiceClient = artistServiceClient;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllArtists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return ResponseEntity.ok(ApiResponse.success(artistServiceClient.getAllArtists(page, size, sort),
                "Lấy danh sách nghệ sĩ thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getArtistById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(artistServiceClient.getArtistById(id),
                "Lấy thông tin nghệ sĩ thành công"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateArtistStatus(@PathVariable UUID id,
                                                                 @RequestBody Map<String, Boolean> payload) {
        if (payload.get("isActive") == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Trường 'isActive' là bắt buộc"));
        }
        artistServiceClient.updateArtistStatus(id, payload);
        return ResponseEntity.ok(ApiResponse.success(null,
                Boolean.TRUE.equals(payload.get("isActive")) ? "Mở khóa tài khoản nghệ sĩ thành công" : "Khóa tài khoản nghệ sĩ thành công"));
    }
}