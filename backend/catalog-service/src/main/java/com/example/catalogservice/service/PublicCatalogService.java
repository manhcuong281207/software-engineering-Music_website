package com.example.catalogservice.service;

import com.example.catalogservice.exception.ResourceNotFoundException;
import com.example.catalogservice.model.dto.response.*;
import com.example.catalogservice.model.entity.Lyrics;
import com.example.catalogservice.model.entity.Song;
import com.example.catalogservice.repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PublicCatalogService {
    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;
    private final GenreRepository genreRepository;
    private final LyricsRepository lyricsRepository;
    private final ModelMapper modelMapper;

    public PublicCatalogService(SongRepository songRepository, AlbumRepository albumRepository,
                                GenreRepository genreRepository, LyricsRepository lyricsRepository,
                                ModelMapper modelMapper) {
        this.songRepository = songRepository;
        this.albumRepository = albumRepository;
        this.genreRepository = genreRepository;
        this.lyricsRepository = lyricsRepository;
        this.modelMapper = modelMapper;
    }

    @Transactional(readOnly = true)
    public Page<SongResponse> searchPublicSongs(String keyword, UUID genreId, Pageable pageable) {
        return songRepository.findPublicSongs(keyword, genreId, pageable).map(song -> modelMapper.map(song, SongResponse.class));
    }

    @Transactional(readOnly = true)
    public Page<AlbumResponse> getPublicAlbums(Pageable pageable) {
        return albumRepository.findByStatus("APPROVED", pageable).map(album -> modelMapper.map(album, AlbumResponse.class));
    }

    @Transactional(readOnly = true)
    public SongResponse getSongById(UUID id) {
        Song song = songRepository.findById(id).filter(s -> "APPROVED".equals(s.getStatus()) && !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Bài hát không tồn tại hoặc chưa được duyệt"));
        return modelMapper.map(song, SongResponse.class);
    }

    @Transactional(readOnly = true)
    public AlbumResponse getAlbumById(UUID id) {
        var album = albumRepository.findById(id).filter(a -> "APPROVED".equals(a.getStatus()))
                .orElseThrow(() -> new ResourceNotFoundException("Album không tồn tại hoặc chưa được duyệt"));
        return modelMapper.map(album, AlbumResponse.class);
    }

    @Transactional(readOnly = true)
    public LyricsResponse getLyricsBySongId(UUID songId) {
        Song song = songRepository.findById(songId).filter(s -> "APPROVED".equals(s.getStatus()) && !Boolean.TRUE.equals(s.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Bài hát không tồn tại hoặc chưa được duyệt"));
        Lyrics lyrics = lyricsRepository.findBySongId(song.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lời bài hát"));
        return modelMapper.map(lyrics, LyricsResponse.class);
    }

    @Transactional(readOnly = true)
    public Page<SongResponse> getSongsByArtist(UUID artistId, Pageable pageable) {
        return songRepository.findByOwnerIdAndStatusAndIsDeletedFalse(artistId, "APPROVED", pageable)
                .map(song -> modelMapper.map(song, SongResponse.class));
    }

    @Transactional(readOnly = true)
    public Page<AlbumResponse> getAlbumsByArtist(UUID artistId, Pageable pageable) {
        return albumRepository.findByOwnerIdAndStatus(artistId, "APPROVED", pageable)
                .map(album -> modelMapper.map(album, AlbumResponse.class));
    }

    @Transactional(readOnly = true)
    public Page<SongResponse> getSongsByAlbum(UUID albumId, Pageable pageable) {
        if (albumRepository.findById(albumId).filter(a -> "APPROVED".equals(a.getStatus())).isEmpty())
            throw new ResourceNotFoundException("Album chưa được duyệt hoặc không khả dụng");
        return songRepository.findByAlbumIdAndStatusAndIsDeletedFalse(albumId, "APPROVED", pageable)
                .map(song -> modelMapper.map(song, SongResponse.class));
    }

    @Transactional(readOnly = true)
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll().stream().map(genre -> modelMapper.map(genre, GenreResponse.class)).toList();
    }
}