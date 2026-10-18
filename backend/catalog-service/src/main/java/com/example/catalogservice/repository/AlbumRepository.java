package com.example.catalogservice.repository;

import com.example.catalogservice.model.entity.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AlbumRepository extends JpaRepository<Album, UUID> {
    Page<Album> findByOwnerId(UUID ownerId, Pageable pageable);
    Page<Album> findByOwnerIdAndStatus(UUID ownerId, String status, Pageable pageable);
    Page<Album> findByStatus(String status, Pageable pageable);
}