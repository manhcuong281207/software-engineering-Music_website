package com.example.usersservice.listener;

import com.example.usersservice.model.dto.event.ArtistProfileUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ArtistEventListener {
    private final JdbcTemplate jdbc;

    @KafkaListener(topics = "artist-events-topic", groupId = "users-group")
    @Transactional
    public void handleArtistProfileUpdated(ArtistProfileUpdatedEvent event) {
        UUID artistId = UUID.fromString(event.artistId());
        jdbc.update("UPDATE follows SET artist_name = ?, avatar_url = ? WHERE artist_id = ?",
                event.newName(), event.newAvatarUrl(), artistId);
        if (event.oldName() != null && !event.oldName().equals(event.newName())) {
            jdbc.update("UPDATE playlist_songs SET artist_name = ? WHERE artist_name = ?", event.newName(), event.oldName());
            jdbc.update("UPDATE play_history SET artist_name = ? WHERE artist_name = ?", event.newName(), event.oldName());
            jdbc.update("UPDATE favorites SET artist_name = ? WHERE artist_name = ?", event.newName(), event.oldName());
            jdbc.update("UPDATE favorite_albums SET artist_name = ? WHERE artist_name = ?", event.newName(), event.oldName());
        }
        log.info("Synchronized user denormalized artist data for {}", artistId);
    }
}