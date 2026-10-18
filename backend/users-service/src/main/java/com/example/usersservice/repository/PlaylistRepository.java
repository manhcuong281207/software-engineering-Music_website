package com.example.usersservice.repository;

import com.example.usersservice.model.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PlaylistRepository extends JpaRepository<Playlist, UUID> {
    Page<Playlist> findByUserId(UUID userId, Pageable pageable);
}
