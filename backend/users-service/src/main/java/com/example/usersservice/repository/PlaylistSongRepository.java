package com.example.usersservice.repository;

import com.example.usersservice.model.entity.PlaylistSong;
import com.example.usersservice.model.entity.PlaylistSongId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, PlaylistSongId> {
    Page<PlaylistSong> findByPlaylistIdOrderByAddedAtDesc(UUID playlistId, Pageable pageable);

    @Modifying
    @Query("UPDATE PlaylistSong ps SET ps.artistName = :newName WHERE ps.artistName = :oldName")
    void updateArtistName(@Param("oldName") String oldName, @Param("newName") String newName);
}
