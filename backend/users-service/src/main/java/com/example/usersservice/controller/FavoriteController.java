package com.example.usersservice.controller;

import com.example.usersservice.exception.ApiException;
import com.example.usersservice.model.dto.response.ApiResponse;
import com.example.usersservice.model.dto.response.FavoriteAlbumResponse;
import com.example.usersservice.model.dto.response.FavoriteResponse;
import com.example.usersservice.service.FavoriteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/user/favorites")
@PreAuthorize("hasRole('USER')")
public class FavoriteController {
    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/{songId}")
    public ResponseEntity<ApiResponse<Void>> addFavorite(@PathVariable UUID songId, Authentication authentication) {
        favoriteService.addFavorite(currentUserId(authentication), songId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(null, "Đã thêm vào danh sách yêu thích"));
    }

    @DeleteMapping("/{songId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable UUID songId, Authentication authentication) {
        favoriteService.removeFavorite(currentUserId(authentication), songId);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa khỏi danh sách yêu thích"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FavoriteResponse>>> getUserFavorites(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = pageable(page, size);
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getUserFavorites(currentUserId(authentication), pageable),
                "Lấy danh sách yêu thích thành công"));
    }

    @PostMapping("/albums/{albumId}")
    public ResponseEntity<ApiResponse<Void>> addFavoriteAlbum(@PathVariable UUID albumId, Authentication authentication) {
        favoriteService.addFavoriteAlbum(currentUserId(authentication), albumId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(null, "Đã thêm album vào danh sách yêu thích"));
    }

    @DeleteMapping("/albums/{albumId}")
    public ResponseEntity<ApiResponse<Void>> removeFavoriteAlbum(@PathVariable UUID albumId, Authentication authentication) {
        favoriteService.removeFavoriteAlbum(currentUserId(authentication), albumId);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa album khỏi danh sách yêu thích"));
    }

    @GetMapping("/albums")
    public ResponseEntity<ApiResponse<Page<FavoriteAlbumResponse>>> getUserFavoriteAlbums(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = pageable(page, size);
        return ResponseEntity.ok(ApiResponse.success(
                favoriteService.getUserFavoriteAlbums(currentUserId(authentication), pageable),
                "Lấy danh sách album yêu thích thành công"));
    }

    private UUID currentUserId(Authentication authentication) {
        try {
            return UUID.fromString(authentication.getName());
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token người dùng không hợp lệ");
        }
    }

    private Pageable pageable(int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tham số phân trang không hợp lệ");
        }
        return PageRequest.of(page, size);
    }
}