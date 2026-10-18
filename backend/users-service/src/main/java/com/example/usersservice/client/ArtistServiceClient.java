package com.example.usersservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "artists-service", url = "${artist.service.url}")
public interface ArtistServiceClient {
    @GetMapping("/api/internal/artists/{id}")
    Map<String, Object> getArtistDetails(@PathVariable("id") UUID id);

    @PutMapping("/api/internal/artists/{artistId}/increment-follower")
    void incrementFollower(@PathVariable("artistId") UUID artistId);

    @PutMapping("/api/internal/artists/{artistId}/decrement-follower")
    void decrementFollower(@PathVariable("artistId") UUID artistId);
}