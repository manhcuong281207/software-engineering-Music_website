package com.example.catalogservice.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "songs")
@Data
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;
    @Column(name = "owner_name")
    private String ownerName;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;
    @Column(nullable = false)
    private String title;
    @Column(name = "track_number")
    private Integer trackNumber;
    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds = 0;
    @Column(name = "audio_url", nullable = false)
    private String audioUrl;
    @Column(name = "audio_public_id")
    private String audioPublicId;
    @Column(name = "cover_image")
    private String coverImage;
    private Boolean explicit = false;
    @Column(name = "play_count")
    private Integer playCount = 0;
    @Column(name = "like_count")
    private Integer likeCount = 0;
    private String status = "PENDING";
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @ManyToMany
    @JoinTable(name = "song_genres", joinColumns = @JoinColumn(name = "song_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id"))
    private Set<Genre> genres = new HashSet<>();
    @OneToMany(mappedBy = "song", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SongArtist> artists = new HashSet<>();
}