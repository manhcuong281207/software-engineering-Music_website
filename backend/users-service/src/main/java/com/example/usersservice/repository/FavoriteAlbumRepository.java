package com.example.usersservice.repository;

import com.example.usersservice.model.entity.FavoriteAlbum;
import com.example.usersservice.model.entity.FavoriteAlbumId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FavoriteAlbumRepository extends JpaRepository<FavoriteAlbum, FavoriteAlbumId> {
    Page<FavoriteAlbum> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}