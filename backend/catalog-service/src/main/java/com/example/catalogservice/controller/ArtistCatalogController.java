package com.example.catalogservice.controller;

import com.example.catalogservice.model.dto.request.*;
import com.example.catalogservice.model.dto.response.*;
import com.example.catalogservice.service.AlbumService;
import com.example.catalogservice.service.SongService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/catalog/artist")
@PreAuthorize("hasRole('ARTIST')")
public class ArtistCatalogController {
    private final AlbumService albumService;
    private final SongService songService;

    public ArtistCatalogController(AlbumService albumService, SongService songService) {
        this.albumService = albumService;
        this.songService = songService;
    }

    @PostMapping("/albums")
    public ResponseEntity<ApiResponse<AlbumResponse>> createAlbum(@Valid @ModelAttribute AlbumCreateRequest request,
                                                                   Authentication authentication) {
        AlbumResponse response = albumService.createAlbum(request, currentArtistId(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response, "Tạo album thành công"));
    }

    @GetMapping("/albums")
    public ResponseEntity<ApiResponse<Page<AlbumResponse>>> getMyAlbums(Authentication authentication,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(albumService.getAlbumsByOwner(currentArtistId(authentication), pageable(page, size)),
                "Lấy danh sách album thành công"));
    }

    @PostMapping("/songs")
    public ResponseEntity<ApiResponse<SongResponse>> uploadSong(@Valid @ModelAttribute SongUploadRequest request,
                                                                  Authentication authentication) {
        SongResponse response = songService.uploadSong(request, currentArtistId(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response, "Upload nhạc thành công"));
    }

    @GetMapping("/songs")
    public ResponseEntity<ApiResponse<Page<SongResponse>>> getMySongs(Authentication authentication,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(songService.getSongsByOwner(currentArtistId(authentication), pageable(page, size)),
                "Lấy danh sách bài hát thành công"));
    }

    @PostMapping("/songs/{songId}/lyrics")
    public ResponseEntity<ApiResponse<Void>> updateLyrics(@PathVariable UUID songId,
            @Valid @RequestBody LyricsUpdateRequest request, Authentication authentication) {
        songService.updateLyrics(songId, request, currentArtistId(authentication));
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật lời bài hát thành công"));
    }

    @PostMapping("/songs/{songId}/artists")
    public ResponseEntity<ApiResponse<Void>> addSongArtist(@PathVariable UUID songId,
            @Valid @RequestBody SongArtistAddRequest request, Authentication authentication) {
        songService.addSongArtist(songId, request, currentArtistId(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(null, "Thêm nghệ sĩ phụ thành công"));
    }

    @PostMapping("/albums/{albumId}/songs")
    public ResponseEntity<ApiResponse<Void>> addSongToAlbum(@PathVariable UUID albumId,
            @Valid @RequestBody AlbumSongAddRequest request, Authentication authentication) {
        songService.addSongToAlbum(albumId, request, currentArtistId(authentication));
        return ResponseEntity.ok(ApiResponse.success(null, "Thêm bài hát vào album thành công"));
    }

    @PutMapping("/albums/{albumId}/songs/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderSongsInAlbum(@PathVariable UUID albumId,
            @Valid @RequestBody AlbumSongReorderRequest request, Authentication authentication) {
        songService.reorderSongsInAlbum(albumId, request, currentArtistId(authentication));
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật thứ tự bài hát thành công"));
    }

    private UUID currentArtistId(Authentication authentication) {
        try {
            return UUID.fromString(authentication.getName());
        } catch (RuntimeException exception) {
            throw new com.example.catalogservice.exception.UnauthorizedAccessException("Token nghệ sĩ không hợp lệ");
        }
    }

    private PageRequest pageable(int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("Tham số phân trang không hợp lệ");
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}