package com.example.catalogservice.controller;

import com.example.catalogservice.exception.BadRequestException;
import com.example.catalogservice.model.dto.response.*;
import com.example.catalogservice.service.AlbumService;
import com.example.catalogservice.service.SongService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/catalog/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminCatalogController {
    private static final Set<String> SONG_SORT_FIELDS = Set.of("playCount", "likeCount", "createdAt", "title");
    private static final Set<String> ALBUM_SORT_FIELDS = Set.of("likeCount", "createdAt", "title", "releaseDate", "totalTracks");
    private final SongService songService;
    private final AlbumService albumService;

    public AdminCatalogController(SongService songService, AlbumService albumService) {
        this.songService = songService;
        this.albumService = albumService;
    }

    @GetMapping("/songs/pending")
    public ResponseEntity<ApiResponse<Page<SongResponse>>> getPendingSongs(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(ApiResponse.success(songService.getSongsByStatus("PENDING", pageable(page, size,
                sort, SONG_SORT_FIELDS, "createdAt")), "Lấy danh sách bài hát chờ duyệt thành công"));
    }

    @PatchMapping("/songs/{songId}/status")
    public ResponseEntity<ApiResponse<Void>> updateSongStatus(@PathVariable UUID songId,
                                                                 @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        validateStatus(status);
        songService.updateSongStatus(songId, status);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái bài hát thành công"));
    }

    @GetMapping("/albums/pending")
    public ResponseEntity<ApiResponse<Page<AlbumResponse>>> getPendingAlbums(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(ApiResponse.success(albumService.getAlbumsByStatus("PENDING", pageable(page, size,
                sort, ALBUM_SORT_FIELDS, "createdAt")), "Lấy danh sách album chờ duyệt thành công"));
    }

    @PatchMapping("/albums/{albumId}/status")
    public ResponseEntity<ApiResponse<Void>> updateAlbumStatus(@PathVariable UUID albumId,
                                                                 @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        validateStatus(status);
        albumService.updateAlbumStatus(albumId, status);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái album thành công"));
    }

    private Pageable pageable(int page, int size, String sort, Set<String> allowedFields, String defaultField) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("Tham số phân trang không hợp lệ");
        String[] parts = sort == null ? new String[0] : sort.split(",");
        String field = parts.length > 0 && allowedFields.contains(parts[0].trim()) ? parts[0].trim() : defaultField;
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, field));
    }

    private void validateStatus(String status) {
        if (!Set.of("APPROVED", "REJECTED", "TAKEDOWN").contains(status))
            throw new BadRequestException("Trạng thái không hợp lệ");
    }
}