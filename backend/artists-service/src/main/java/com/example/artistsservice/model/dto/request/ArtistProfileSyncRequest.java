package com.example.artistsservice.model.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ArtistProfileSyncRequest(@NotBlank String stageName, String biography, String avatarUrl) {
}