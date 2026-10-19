package com.example.usersservice.service;

import com.example.usersservice.client.AlbumInternalResponse;
import com.example.usersservice.client.CatalogServiceClient;
import com.example.usersservice.client.SongInternalResponse;
import com.example.usersservice.exception.ApiException;
import com.example.usersservice.model.dto.response.FavoriteAlbumResponse;
import com.example.usersservice.model.dto.response.FavoriteResponse;
import com.example.usersservice.model.entity.Favorite;
import com.example.usersservice.model.entity.FavoriteAlbum;
import com.example.usersservice.model.entity.FavoriteAlbumId;
import com.example.usersservice.model.entity.FavoriteId;
import com.example.usersservice.repository.FavoriteAlbumRepository;
import com.example.usersservice.repository.FavoriteRepository;
import feign.FeignException;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class FavoriteService {
    private static final Logger log = LoggerFactory.getLogger(FavoriteService.class);

    private final FavoriteRepository favoriteRepository;
    private final FavoriteAlbumRepository favoriteAlbumRepository;
    private final CatalogServiceClient catalogServiceClient;
    private final ModelMapper modelMapper;

    public FavoriteService(FavoriteRepository favoriteRepository, FavoriteAlbumRepository favoriteAlbumRepository,
                           CatalogServiceClient catalogServiceClient, ModelMapper modelMapper) {
        this.favoriteRepository = favoriteRepository;
        this.favoriteAlbumRepository = favoriteAlbumRepository;
        this.catalogServiceClient = catalogServiceClient;
        this.modelMapper = modelMapper;
    }

    @Transactional
    public void addFavorite(UUID userId, UUID songId) {
        FavoriteId id = new FavoriteId(userId, songId);
        if (favoriteRepository.existsById(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Bài hát đã có trong danh sách yêu thích");
        }

        SongInternalResponse song = getSong(songId);
        requireApproved(song.getStatus(), "Bài hát chưa được duyệt hoặc không khả dụng");
        favoriteRepository.save(Favorite.builder()
                .userId(userId).songId(songId).songTitle(song.getTitle())
                .artistName(song.getOwnerName()).coverImage(song.getCoverImage()).build());
        synchronizeCounter("song", songId, () -> catalogServiceClient.incrementLike(songId));
    }

    @Transactional
    public void removeFavorite(UUID userId, UUID songId) {
        FavoriteId id = new FavoriteId(userId, songId);
        if (!favoriteRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Bài hát chưa có trong danh sách yêu thích");
        }
        favoriteRepository.deleteById(id);
        synchronizeCounter("song", songId, () -> catalogServiceClient.decrementLike(songId));
    }

    @Transactional(readOnly = true)
    public Page<FavoriteResponse> getUserFavorites(UUID userId, Pageable pageable) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(favorite -> modelMapper.map(favorite, FavoriteResponse.class));
    }

    @Transactional
    public void addFavoriteAlbum(UUID userId, UUID albumId) {
        FavoriteAlbumId id = new FavoriteAlbumId(userId, albumId);
        if (favoriteAlbumRepository.existsById(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Album đã có trong danh sách yêu thích");
        }

        AlbumInternalResponse album = getAlbum(albumId);
        requireApproved(album.getStatus(), "Album chưa được duyệt hoặc không khả dụng");
        favoriteAlbumRepository.save(FavoriteAlbum.builder()
                .userId(userId).albumId(albumId).albumTitle(album.getTitle())
                .artistName(album.getOwnerName()).coverImage(album.getCoverImage()).build());
        synchronizeCounter("album", albumId, () -> catalogServiceClient.incrementAlbumLike(albumId));
    }

    @Transactional
    public void removeFavoriteAlbum(UUID userId, UUID albumId) {
        FavoriteAlbumId id = new FavoriteAlbumId(userId, albumId);
        if (!favoriteAlbumRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Album chưa có trong danh sách yêu thích");
        }
        favoriteAlbumRepository.deleteById(id);
        synchronizeCounter("album", albumId, () -> catalogServiceClient.decrementAlbumLike(albumId));
    }

    @Transactional(readOnly = true)
    public Page<FavoriteAlbumResponse> getUserFavoriteAlbums(UUID userId, Pageable pageable) {
        return favoriteAlbumRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(favorite -> modelMapper.map(favorite, FavoriteAlbumResponse.class));
    }

    private SongInternalResponse getSong(UUID id) {
        try {
            return catalogServiceClient.getSongDetails(id);
        } catch (FeignException.NotFound exception) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bài hát trên hệ thống");
        } catch (FeignException exception) {
            log.warn("Catalog lookup failed for song {} with status {}", id, exception.status());
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Không thể xác minh bài hát lúc này");
        }
    }

    private AlbumInternalResponse getAlbum(UUID id) {
        try {
            return catalogServiceClient.getAlbumDetails(id);
        } catch (FeignException.NotFound exception) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy album trên hệ thống");
        } catch (FeignException exception) {
            log.warn("Catalog lookup failed for album {} with status {}", id, exception.status());
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Không thể xác minh album lúc này");
        }
    }

    private void requireApproved(String status, String message) {
        if (!"APPROVED".equals(status)) {
            throw new ApiException(HttpStatus.NOT_FOUND, message);
        }
    }

    private void synchronizeCounter(String resourceType, UUID resourceId, Runnable operation) {
        try {
            operation.run();
        } catch (RuntimeException exception) {
            log.error("Failed to synchronize {} like counter for {}", resourceType, resourceId, exception);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể đồng bộ lượt yêu thích lúc này; vui lòng thử lại");
        }
    }
}