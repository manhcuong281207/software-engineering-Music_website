package com.example.catalogservice.controller;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/catalog")
public class InternalCatalogController {
    private final JdbcTemplate jdbc;

    public InternalCatalogController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PutMapping("/songs/{id}/increment-play")
    public ResponseEntity<Void> incrementPlay(@PathVariable UUID id) {
        updateCount("UPDATE songs SET play_count = play_count + 1 WHERE id = ?", id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/songs/{id}/increment-like")
    public ResponseEntity<Void> incrementLike(@PathVariable UUID id) {
        updateCount("UPDATE songs SET like_count = like_count + 1 WHERE id = ?", id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/songs/{id}/decrement-like")
    public ResponseEntity<Void> decrementLike(@PathVariable UUID id) {
        updateCount("UPDATE songs SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?", id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/songs/{id}")
    public ResponseEntity<Map<String, Object>> getSongDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(queryOne("""
                SELECT id, owner_id AS \"ownerId\", owner_name AS \"ownerName\", title,
                       duration_seconds AS \"durationSeconds\", audio_url AS \"audioUrl\",
                       cover_image AS \"coverImage\", explicit, play_count AS \"playCount\",
                       like_count AS \"likeCount\", status, created_at AS \"createdAt\"
                FROM songs WHERE id = ? AND is_deleted = false
                """, id, "Song not found"));
    }

    @PutMapping("/albums/{id}/increment-like")
    public ResponseEntity<Void> incrementAlbumLike(@PathVariable UUID id) {
        updateCount("UPDATE albums SET like_count = like_count + 1 WHERE id = ?", id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/albums/{id}/decrement-like")
    public ResponseEntity<Void> decrementAlbumLike(@PathVariable UUID id) {
        updateCount("UPDATE albums SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?", id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/albums/{id}")
    public ResponseEntity<Map<String, Object>> getAlbumDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(queryOne("""
                SELECT id, owner_id AS \"ownerId\", owner_name AS \"ownerName\", title,
                       album_type AS \"albumType\", total_tracks AS \"totalTracks\", description,
                       cover_image AS \"coverImage\", release_date AS \"releaseDate\", status,
                       like_count AS \"likeCount\", created_at AS \"createdAt\"
                FROM albums WHERE id = ?
                """, id, "Album not found"));
    }

    @GetMapping("/artists/{id}/stats")
    public ResponseEntity<Map<String, Object>> getArtistStats(@PathVariable UUID id) {
        Map<String, Object> stats = jdbc.queryForMap("""
                SELECT COUNT(*) AS \"totalSongs\", COALESCE(SUM(play_count), 0) AS \"totalPlays\",
                       COALESCE(SUM(like_count), 0) AS \"totalLikes\"
                FROM songs WHERE owner_id = ? AND is_deleted = false
                """, id);
        return ResponseEntity.ok(stats);
    }

    private void updateCount(String sql, UUID id) {
        if (jdbc.update(sql, id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Catalog resource not found");
        }
    }

    private Map<String, Object> queryOne(String sql, UUID id, String message) {
        try {
            return jdbc.queryForMap(sql, id);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, message);
        }
    }
}