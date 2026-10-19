package com.example.catalogservice.model.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
public class SongArtistId implements Serializable {
    private UUID song;
    private UUID artistId;
}