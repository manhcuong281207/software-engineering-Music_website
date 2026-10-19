package com.example.usersservice.repository;

import com.example.usersservice.model.entity.PlayHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PlayHistoryRepository extends JpaRepository<PlayHistory, UUID> {
    Page<PlayHistory> findByUserIdOrderByPlayedAtDesc(UUID userId, Pageable pageable);
}