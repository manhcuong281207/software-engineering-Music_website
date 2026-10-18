package com.example.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "artists-service", url = "${artists.service.url}")
public interface ArtistServiceClient {
    @GetMapping("/api/internal/artists/admin")
    Map<String, Object> getAllArtists(@RequestParam("page") int page, @RequestParam("size") int size,
                                      @RequestParam("sort") String sort);

    @GetMapping("/api/internal/artists/{id}/admin")
    Map<String, Object> getArtistById(@PathVariable("id") UUID id);

    @PatchMapping("/api/internal/artists/{id}/status")
    void updateArtistStatus(@PathVariable("id") UUID id, @RequestBody Map<String, Boolean> payload);
}