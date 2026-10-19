package com.example.usersservice.repository;

import com.example.usersservice.model.entity.FollowArtist;
import com.example.usersservice.model.entity.FollowArtistId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FollowArtistRepository extends JpaRepository<FollowArtist, FollowArtistId> {
    Page<FollowArtist> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}