package com.example.usersservice.controller;

import com.example.usersservice.exception.ApiException;
import com.example.usersservice.model.dto.response.ApiResponse;
import com.example.usersservice.model.dto.response.FollowArtistResponse;
import com.example.usersservice.service.FollowArtistService;
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
@RequestMapping("/api/user/follows/artists")
@PreAuthorize("hasRole('USER')")
public class FollowArtistController {
    private final FollowArtistService followArtistService;

    public FollowArtistController(FollowArtistService followArtistService) {
        this.followArtistService = followArtistService;
    }

    @PostMapping("/{artistId}")
    public ResponseEntity<ApiResponse<Void>> followArtist(@PathVariable UUID artistId, Authentication authentication) {
        followArtistService.followArtist(currentUserId(authentication), artistId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(null, "Đã theo dõi nghệ sĩ"));
    }

    @DeleteMapping("/{artistId}")
    public ResponseEntity<ApiResponse<Void>> unfollowArtist(@PathVariable UUID artistId, Authentication authentication) {
        followArtistService.unfollowArtist(currentUserId(authentication), artistId);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã hủy theo dõi nghệ sĩ"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FollowArtistResponse>>> getUserFollowedArtists(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        if (page < 0 || size < 1 || size > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tham số phân trang không hợp lệ");
        }
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(
                followArtistService.getUserFollowedArtists(currentUserId(authentication), pageable),
                "Lấy danh sách nghệ sĩ đang theo dõi thành công"));
    }

    private UUID currentUserId(Authentication authentication) {
        try {
            return UUID.fromString(authentication.getName());
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token người dùng không hợp lệ");
        }
    }
}