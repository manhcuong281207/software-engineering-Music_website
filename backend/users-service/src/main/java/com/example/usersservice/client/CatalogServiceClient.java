package com.example.usersservice.client;

import com.example.usersservice.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "catalog-service", url = "${catalog.service.url}", configuration = FeignConfig.class)
public interface CatalogServiceClient {
    @GetMapping("/api/internal/catalog/songs/{id}")
    SongInternalResponse getSongDetails(@PathVariable("id") UUID id);
}
