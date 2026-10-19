package com.example.catalogservice.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "song_artists")
@IdClass(SongArtistId.class)
@Data
public class SongArtist {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;
    @Id
    @Column(name = "artist_id", nullable = false)
    private UUID artistId;
    @Column(name = "artist_name", nullable = false)
    private String artistName;
    @Column(nullable = false)
    private String role;
}