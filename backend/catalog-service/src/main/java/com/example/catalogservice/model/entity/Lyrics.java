package com.example.catalogservice.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "lyrics")
@Data
public class Lyrics {
    @Id
    @Column(name = "song_id")
    private UUID id;
    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;
    @Column(columnDefinition = "TEXT")
    private String content;
    @Column(name = "synced_content", columnDefinition = "TEXT")
    private String syncedContent;
    private String language;
}