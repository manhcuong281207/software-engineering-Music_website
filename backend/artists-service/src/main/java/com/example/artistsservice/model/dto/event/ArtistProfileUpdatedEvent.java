package com.example.artistsservice.model.dto.event;

public record ArtistProfileUpdatedEvent(String artistId, String oldName, String newName, String newAvatarUrl) {
}