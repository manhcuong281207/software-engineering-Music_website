package com.example.catalogservice.controller;

import com.example.catalogservice.model.dto.response.*;
import com.example.catalogservice.service.PublicCatalogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/catalog/public")
public class PublicCatalogController {
    private static final Set<String> SONG_SORT_FIELDS = Set.of("playCount", "likeCount", "createdAt", "title");
    private static final Set<String> ALBUM_SORT_FIELDS = Set.of("likeCount", "createdAt", "title", "releaseDate", "totalTracks");
    private final PublicCatalogService publicCatalogService;

    public PublicCatalogController(PublicCatalogService publicCatalogService) {
        this.publicCatalogService = publicCatalogService;
    }

    @GetMapping("/songs")
    public ResponseEntity<ApiResponse<Page<SongResponse>>> getPublicSongs(@RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID genreId, @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = pageable(page, size, sort, SONG_SORT_FIELDS);
        return ResponseEntity.ok(ApiResponse.success(publicCatalogService.searchPublicSongs(keyword, genreId, pageable),
                "Lấy danh sách bài hát thành công"));
    }

    @GetMapping("/genres")
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getAllGenres() {
        return ResponseEntity.ok(ApiResponse.success(publicCatalogService.getAllGenres(), "Lấy danh sách thể loại thành công"));
    }

    @GetMapping("/albums")
    public ResponseEntity<ApiResponse<Page<AlbumResponse>>> getPublicAlbums(@RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(publicCatalogService.getPublicAlbums(pageable(page, size, sort, ALBUM_SORT_FIELDS)),
                "Lấy danh sách album thành công"));
    }

    @GetMapping("/artists/{artistId}/songs")
    public ResponseEntity<ApiResponse<Page<SongResponse>>> getSongsByArtist(@PathVariable UUID artistId,
            @RequestParam(required = false) String sort, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(publicCatalogService.getSongsByArtist(artistId,
                pageable(page, size, sort, SONG_SORT_FIELDS)), "Lấy danh sách bài hát của nghệ sĩ thành công"));
    }

    @GetMapping("/artists/{artistId}/albums")
    public ResponseEntity<ApiResponse<Page<AlbumResponse>>> getAlbumsByArtist(@PathVariable UUID artistId,
            @RequestParam(required = false) String sort, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(publicCatalogService.getAlbumsByArtist(artistId,
                pageable(page, size, sort, ALBUM_SORT_FIELDS)), "Lấy danh sách album của nghệ sĩ thành công"));
    }

    @GetMapping("/albums/{albumId}/songs")
    public ResponseEntity<ApiResponse<Page<SongResponse>>> getSongsByAlbum(@PathVariable UUID albumId,
            @RequestParam(required = false) String sort, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(publicCatalogService.getSongsByAlbum(albumId,
                pageable(page, size, sort, SONG_SORT_FIELDS)), "Lấy danh sách bài hát trong album thành công"));
    }

    @GetMapping("/songs/{id}")
    public ResponseEntity<ApiResponse<SongResponse>> getSongById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(publicCatalogService.getSongById(id), "Lấy thông tin bài hát thành công"));
    }

    @GetMapping("/albums/{id}")
    public ResponseEntity<ApiResponse<AlbumResponse>> getAlbumById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(publicCatalogService.getAlbumById(id), "Lấy thông tin album thành công"));
    }

    @GetMapping("/songs/{id}/lyrics")
    public ResponseEntity<ApiResponse<LyricsResponse>> getLyricsBySongId(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(publicCatalogService.getLyricsBySongId(id), "Lấy lời bài hát thành công"));
    }

    private Pageable pageable(int page, int size, String sort, Set<String> allowedFields) {
        if (page < 0 || size < 1 || size > 100) throw new IllegalArgumentException("Tham số phân trang không hợp lệ");
        String[] parts = sort == null ? new String[0] : sort.split(",");
        String field = parts.length > 0 && allowedFields.contains(parts[0].trim()) ? parts[0].trim() : "createdAt";
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, field));
    }
}