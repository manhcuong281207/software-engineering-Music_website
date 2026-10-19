package com.example.usersservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "play_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "song_id", nullable = false)
    private UUID songId;

    @Column(name = "song_title", nullable = false)
    private String songTitle;

    @Column(name = "artist_name", nullable = false)
    private String artistName;

    @Column(name = "cover_image")
    private String coverImage;

    @CreationTimestamp
    @Column(name = "played_at", updatable = false)
    private LocalDateTime playedAt;

    @Column(name = "duration_listened")
    private Integer durationListened;
}