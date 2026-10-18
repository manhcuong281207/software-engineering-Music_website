package com.example.catalogservice.service;

import com.example.catalogservice.client.ArtistInternalResponse;
import com.example.catalogservice.client.ArtistServiceClient;
import com.example.catalogservice.exception.FileStorageException;
import com.example.catalogservice.exception.ResourceNotFoundException;
import com.example.catalogservice.model.dto.request.AlbumCreateRequest;
import com.example.catalogservice.model.dto.response.AlbumResponse;
import com.example.catalogservice.model.entity.Album;
import com.example.catalogservice.model.entity.Song;
import com.example.catalogservice.repository.AlbumRepository;
import com.example.catalogservice.repository.SongRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;
    private final ArtistServiceClient artistServiceClient;
    private final CloudinaryService cloudinaryService;
    private final ModelMapper modelMapper;

    public AlbumService(AlbumRepository albumRepository, SongRepository songRepository,
                        ArtistServiceClient artistServiceClient, CloudinaryService cloudinaryService,
                        ModelMapper modelMapper) {
        this.albumRepository = albumRepository;
        this.songRepository = songRepository;
        this.artistServiceClient = artistServiceClient;
        this.cloudinaryService = cloudinaryService;
        this.modelMapper = modelMapper;
    }

    @Transactional
    public AlbumResponse createAlbum(AlbumCreateRequest request, UUID ownerId) {
        Album album = modelMapper.map(request, Album.class);
        album.setOwnerId(ownerId);
        ArtistInternalResponse artist = artistServiceClient.getArtistById(ownerId);
        album.setOwnerName(artist.getStageName());
        album.setStatus("PENDING");
        album.setTotalTracks(0);
        if (request.getAlbumType() == null || request.getAlbumType().isBlank()) album.setAlbumType("ALBUM");
        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            try {
                Map<?, ?> result = cloudinaryService.uploadImage(request.getCoverImage());
                album.setCoverImage((String) result.get("secure_url"));
            } catch (IOException exception) {
                throw new FileStorageException("Không thể tải ảnh bìa album lên kho lưu trữ", exception);
            }
        }
        return modelMapper.map(albumRepository.save(album), AlbumResponse.class);
    }

    @Transactional(readOnly = true)
    public Page<AlbumResponse> getAlbumsByOwner(UUID ownerId, Pageable pageable) {
        return albumRepository.findByOwnerId(ownerId, pageable).map(album -> modelMapper.map(album, AlbumResponse.class));
    }

    @Transactional(readOnly = true)
    public Page<AlbumResponse> getAlbumsByStatus(String status, Pageable pageable) {
        return albumRepository.findByStatus(status, pageable).map(album -> modelMapper.map(album, AlbumResponse.class));
    }

    @Transactional
    public void updateAlbumStatus(UUID albumId, String status) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new ResourceNotFoundException("Album không tồn tại"));
        album.setStatus(status);
        albumRepository.save(album);
        List<Song> tracks = songRepository.findByAlbumId(albumId);
        tracks.forEach(song -> song.setStatus(status));
        songRepository.saveAll(tracks);
    }
}