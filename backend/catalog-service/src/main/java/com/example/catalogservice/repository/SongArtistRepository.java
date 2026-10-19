package com.example.catalogservice.repository;

import com.example.catalogservice.model.entity.SongArtist;
import com.example.catalogservice.model.entity.SongArtistId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SongArtistRepository extends JpaRepository<SongArtist, SongArtistId> {
    boolean existsBySongIdAndArtistId(UUID songId, UUID artistId);

    @Modifying
    @Query("UPDATE SongArtist sa SET sa.artistName = :newName WHERE sa.artistId = :artistId")
    void updateArtistName(@Param("artistId") UUID artistId, @Param("newName") String newName);
}