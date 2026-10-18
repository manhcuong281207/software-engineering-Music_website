package com.example.catalogservice.model.dto.event;

public record ArtistProfileUpdatedEvent(String artistId, String oldName, String newName, String newAvatarUrl) {
}