package com.example.artistsservice.controller;

import com.example.artistsservice.exception.ApiException;
import com.example.artistsservice.model.entity.Artist;
import com.example.artistsservice.repository.ArtistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/artists")
public class InternalArtistController {

    private static final Set<String> SORT_FIELDS = Set.of("stageName", "createdAt", "followerCount");
    private final ArtistRepository artistRepository;

    public InternalArtistController(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    @GetMapping("/{artistId}")
    public ResponseEntity<Map<String, Object>> getArtistById(@PathVariable UUID artistId) {
        Artist artist = findArtist(artistId);
        return ResponseEntity.ok(Map.of("id", artist.getId(), "stageName", artist.getStageName(),
                "avatarUrl", artist.getAvatarUrl() == null ? "" : artist.getAvatarUrl()));
    }

    @GetMapping("/admin")
    public ResponseEntity<Page<Map<String, Object>>> getAllArtistsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] parts = sort.split(",");
        String field = SORT_FIELDS.contains(parts[0].trim()) ? parts[0].trim() : "createdAt";
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, field));
        return ResponseEntity.ok(artistRepository.findAll(pageable).map(this::toAdminMap));
    }

    @GetMapping("/{artistId}/admin")
    public ResponseEntity<Map<String, Object>> getArtistForAdmin(@PathVariable UUID artistId) {
        return ResponseEntity.ok(toAdminMap(findArtist(artistId)));
    }

    @PutMapping("/{artistId}/increment-follower")
    @Transactional
    public ResponseEntity<Void> incrementFollower(@PathVariable UUID artistId) {
        Artist artist = findArtist(artistId);
        artistRepository.incrementFollowerCount(artistId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{artistId}/decrement-follower")
    @Transactional
    public ResponseEntity<Void> decrementFollower(@PathVariable UUID artistId) {
        findArtist(artistId);
        artistRepository.decrementFollowerCount(artistId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{artistId}/status")
    @Transactional
    public ResponseEntity<Void> updateArtistStatus(@PathVariable UUID artistId, @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("isActive");
        if (active == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Trường 'isActive' là bắt buộc");
        }
        Artist artist = findArtist(artistId);
        artist.setIsActive(active);
        artistRepository.save(artist);
        return ResponseEntity.ok().build();
    }

    private Artist findArtist(UUID id) {
        return artistRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy nghệ sĩ với ID: " + id));
    }

    private Map<String, Object> toAdminMap(Artist artist) {
        return Map.of("id", artist.getId(), "email", artist.getEmail(), "stageName", artist.getStageName(),
                "avatarUrl", artist.getAvatarUrl() == null ? "" : artist.getAvatarUrl(),
                "isActive", artist.getIsActive(), "followerCount",
                artist.getFollowerCount() == null ? 0 : artist.getFollowerCount(), "createdAt", artist.getCreatedAt());
    }
}