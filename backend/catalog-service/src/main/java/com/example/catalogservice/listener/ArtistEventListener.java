package com.example.catalogservice.listener;

import com.example.catalogservice.model.dto.event.ArtistProfileUpdatedEvent;
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

    @KafkaListener(topics = "artist-events-topic", groupId = "catalog-group")
    @Transactional
    public void handleArtistProfileUpdated(ArtistProfileUpdatedEvent event) {
        UUID artistId = UUID.fromString(event.artistId());
        jdbc.update("UPDATE albums SET owner_name = ? WHERE owner_id = ?", event.newName(), artistId);
        jdbc.update("UPDATE songs SET owner_name = ? WHERE owner_id = ?", event.newName(), artistId);
        jdbc.update("UPDATE song_artists SET artist_name = ? WHERE artist_id = ?", event.newName(), artistId);
        log.info("Synchronized catalog denormalized artist data for {}", artistId);
    }
}