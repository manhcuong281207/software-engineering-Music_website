package com.example.catalogservice.repository;

import com.example.catalogservice.model.entity.Lyrics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LyricsRepository extends JpaRepository<Lyrics, UUID> {
    Optional<Lyrics> findBySongId(UUID songId);
}