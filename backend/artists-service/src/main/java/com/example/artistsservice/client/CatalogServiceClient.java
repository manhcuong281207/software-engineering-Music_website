package com.example.artistsservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Component
public class CatalogServiceClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String catalogServiceUrl;
    private final String internalSecret;

    public CatalogServiceClient(@Value("${internal.api.secret}") String internalSecret,
                                @Value("${catalog.service.url:http://localhost:8081}") String catalogServiceUrl) {
        this.internalSecret = internalSecret;
        this.catalogServiceUrl = catalogServiceUrl;
    }

    public Map<String, Object> getArtistStats(UUID artistId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", internalSecret);
        return restTemplate.exchange(catalogServiceUrl + "/api/internal/catalog/artists/" + artistId + "/stats",
                HttpMethod.GET, new HttpEntity<>(headers), Map.class).getBody();
    }
}