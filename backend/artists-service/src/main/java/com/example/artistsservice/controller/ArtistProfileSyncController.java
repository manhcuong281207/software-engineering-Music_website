package com.example.artistsservice.controller;

import com.example.artistsservice.model.dto.event.ArtistProfileUpdatedEvent;
import com.example.artistsservice.model.dto.request.ArtistProfileSyncRequest;
import com.example.artistsservice.model.entity.Artist;
import com.example.artistsservice.repository.ArtistRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/artist")
@RequiredArgsConstructor
@Slf4j
public class ArtistProfileSyncController {
    private final ArtistRepository artistRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @PutMapping("/me")
    @PreAuthorize("hasRole('ARTIST')")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateProfile(@Valid @RequestBody ArtistProfileSyncRequest request,
                                                               Authentication authentication) {
        UUID artistId = UUID.fromString(authentication.getName());
        Artist artist = artistRepository.findById(artistId).orElseThrow();
        String oldName = artist.getStageName();
        artist.setStageName(request.stageName());
        if (request.biography() != null) artist.setBiography(request.biography());
        if (request.avatarUrl() != null) artist.setAvatarUrl(request.avatarUrl());
        Artist updated = artistRepository.save(artist);

        ArtistProfileUpdatedEvent event = new ArtistProfileUpdatedEvent(
                updated.getId().toString(), oldName, updated.getStageName(), updated.getAvatarUrl());
        kafkaTemplate.send("artist-events-topic", updated.getId().toString(), event)
                .whenComplete((result, error) -> {
                    if (error != null) log.error("Failed to publish artist profile update event", error);
                });

        return ResponseEntity.ok(Map.of("id", updated.getId(), "stageName", updated.getStageName(),
                "avatarUrl", updated.getAvatarUrl() == null ? "" : updated.getAvatarUrl()));
    }
}