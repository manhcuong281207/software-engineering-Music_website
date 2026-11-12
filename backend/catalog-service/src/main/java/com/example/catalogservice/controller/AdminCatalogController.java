package com.example.catalogservice.controller;

import com.example.catalogservice.model.dto.response.ApiResponse;
import com.example.catalogservice.model.dto.response.SongResponse;
import com.example.catalogservice.model.dto.response.AlbumResponse;
import com.example.catalogservice.service.SongService;
import com.example.catalogservice.service.AlbumService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/catalog/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminCatalogController {

    private static final Set<String> SONG_SORTABLE_FIELDS = Set.of(
            "playCount", "likeCount", "createdAt", "title"
    );
    private static final Set<String> ALBUM_SORTABLE_FIELDS = Set.of(
            "likeCount", "createdAt", "title", "releaseDate", "totalTracks"
    );

    private Sort buildSafeSort(String sortParam, Set<String> allowedFields, String defaultField) {
        if (sortParam == null || sortParam.isBlank()) {
            return Sort.by(Sort.Direction.DESC, defaultField);
        }
        String[] parts = sortParam.split(",");
        String field = parts[0].trim();
        Sort.Direction direction = Sort.Direction.DESC;
        if (parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc")) {
            direction = Sort.Direction.ASC;
        }
        if (!allowedFields.contains(field)) {
            return Sort.by(Sort.Direction.DESC, defaultField);
        }
        return Sort.by(direction, field);
    }

    private final SongService songService;
    private final AlbumService albumService;

    public AdminCatalogController(SongService songService, AlbumService albumService) {
        this.songService = songService;
        this.albumService = albumService;
    }

    @GetMapping("/songs/pending")
    public ResponseEntity<ApiResponse<Page<SongResponse>>> getPendingSongs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        
        Sort sortObj = buildSafeSort(sort, SONG_SORTABLE_FIELDS, "createdAt");
        
        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<SongResponse> response = songService.getSongsByStatus("PENDING", pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách bài hát chờ duyệt thành công"));
    }

    @PatchMapping("/songs/{songId}/status")
    public ResponseEntity<ApiResponse<Void>> updateSongStatus(
            @PathVariable UUID songId,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || (!status.equals("APPROVED") && !status.equals("REJECTED") && !status.equals("TAKEDOWN"))) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Trạng thái không hợp lệ"));
        }
        
        songService.updateSongStatus(songId, status);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái bài hát thành công"));
    }

    @GetMapping("/albums/pending")
    public ResponseEntity<ApiResponse<Page<AlbumResponse>>> getPendingAlbums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        Sort sortObj = buildSafeSort(sort, ALBUM_SORTABLE_FIELDS, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<AlbumResponse> response = albumService.getAlbumsByStatus("PENDING", pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Lấy danh sách album chờ duyệt thành công"));
    }

    @PatchMapping("/albums/{albumId}/status")
    public ResponseEntity<ApiResponse<Void>> updateAlbumStatus(
            @PathVariable UUID albumId,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || (!status.equals("APPROVED") && !status.equals("REJECTED") && !status.equals("TAKEDOWN"))) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Trạng thái không hợp lệ"));
        }
        
        albumService.updateAlbumStatus(albumId, status);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái album thành công"));
    }

    @GetMapping("/songs/{songId}")
    public ResponseEntity<ApiResponse<SongResponse>> getSongById(@PathVariable UUID songId) {
        SongResponse song = songService.getSongById(songId);
        return ResponseEntity.ok(ApiResponse.success(song, "Lấy thông tin chi tiết bài hát thành công"));
    }

    @GetMapping("/songs/{songId}/lyrics")
    public ResponseEntity<ApiResponse<com.example.catalogservice.model.dto.response.LyricsResponse>> getLyricsBySongId(@PathVariable UUID songId) {
        com.example.catalogservice.model.dto.response.LyricsResponse lyrics = songService.getLyricsBySongId(songId);
        return ResponseEntity.ok(ApiResponse.success(lyrics, "Lấy lời bài hát thành công"));
    }

    @GetMapping("/albums/{albumId}")
    public ResponseEntity<ApiResponse<AlbumResponse>> getAlbumById(@PathVariable UUID albumId) {
        AlbumResponse album = albumService.getAlbumById(albumId);
        return ResponseEntity.ok(ApiResponse.success(album, "Lấy thông tin chi tiết album thành công"));
    }

    @GetMapping("/albums/{albumId}/songs")
    public ResponseEntity<ApiResponse<List<SongResponse>>> getAlbumSongs(@PathVariable UUID albumId) {
        List<SongResponse> songs = songService.getSongsByAlbum(albumId);
        return ResponseEntity.ok(ApiResponse.success(songs, "Lấy danh sách bài hát trong album thành công"));
    }
}
