package com.example.catalogservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "artists-service", url = "${artists.service.url}")
public interface ArtistServiceClient {
    @GetMapping("/api/internal/artists/{artistId}")
    Map<String, Object> getArtistById(@PathVariable("artistId") UUID artistId);
}