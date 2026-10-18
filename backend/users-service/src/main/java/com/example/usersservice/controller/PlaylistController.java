package com.example.usersservice.controller;

import com.example.usersservice.model.dto.request.PlaylistCreateRequest;
import com.example.usersservice.model.dto.request.PlaylistSongAddRequest;
import com.example.usersservice.model.dto.response.ApiResponse;
import com.example.usersservice.model.dto.response.PlaylistResponse;
import com.example.usersservice.model.dto.response.PlaylistSongResponse;
import com.example.usersservice.service.PlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user/playlists")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class PlaylistController {
    private final PlaylistService playlistService;

    @PostMapping
    public ResponseEntity<ApiResponse<PlaylistResponse>> createPlaylist(
            @Valid @RequestBody PlaylistCreateRequest request, Authentication authentication) {
        PlaylistResponse response = playlistService.createPlaylist(request, currentUserId(authentication));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Tạo playlist thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PlaylistResponse>>> getMyPlaylists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PlaylistResponse> response = playlistService.getUserPlaylists(currentUserId(authentication), pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách playlist thành công"));
    }

    @PostMapping("/{playlistId}/songs")
    public ResponseEntity<ApiResponse<PlaylistSongResponse>> addSongToPlaylist(
            @PathVariable UUID playlistId,
            @Valid @RequestBody PlaylistSongAddRequest request,
            Authentication authentication) {
        PlaylistSongResponse response = playlistService.addSongToPlaylist(
                playlistId, request, currentUserId(authentication));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Thêm bài hát vào playlist thành công"));
    }

    @DeleteMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<ApiResponse<Void>> removeSongFromPlaylist(
            @PathVariable UUID playlistId,
            @PathVariable UUID songId,
            Authentication authentication) {
        playlistService.removeSongFromPlaylist(playlistId, songId, currentUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa bài hát khỏi playlist thành công"));
    }

    @GetMapping("/{playlistId}/songs")
    public ResponseEntity<ApiResponse<Page<PlaylistSongResponse>>> getPlaylistSongs(
            @PathVariable UUID playlistId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PlaylistSongResponse> response = playlistService.getPlaylistSongs(
                playlistId, currentUserId(authentication), pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách bài hát trong playlist thành công"));
    }

    private UUID currentUserId(Authentication authentication) {
        return UUID.fromString(authentication.getPrincipal().toString());
    }
}
