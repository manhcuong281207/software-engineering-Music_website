package com.example.usersservice.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "favorites")
@IdClass(FavoriteId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Favorite {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Id
    @Column(name = "song_id", nullable = false)
    private UUID songId;

    @Column(name = "song_title", nullable = false)
    private String songTitle;

    @Column(name = "artist_name", nullable = false)
    private String artistName;

    @Column(name = "cover_image")
    private String coverImage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}