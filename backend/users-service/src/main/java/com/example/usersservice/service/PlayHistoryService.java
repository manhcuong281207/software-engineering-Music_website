package com.example.usersservice.service;

import com.example.usersservice.client.CatalogServiceClient;
import com.example.usersservice.client.SongInternalResponse;
import com.example.usersservice.exception.ApiException;
import com.example.usersservice.model.dto.request.PlayHistoryAddRequest;
import com.example.usersservice.model.dto.response.PlayHistoryResponse;
import com.example.usersservice.model.entity.PlayHistory;
import com.example.usersservice.repository.PlayHistoryRepository;
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
public class PlayHistoryService {
    private static final Logger log = LoggerFactory.getLogger(PlayHistoryService.class);

    private final PlayHistoryRepository playHistoryRepository;
    private final CatalogServiceClient catalogServiceClient;
    private final ModelMapper modelMapper;

    public PlayHistoryService(PlayHistoryRepository playHistoryRepository, CatalogServiceClient catalogServiceClient,
                              ModelMapper modelMapper) {
        this.playHistoryRepository = playHistoryRepository;
        this.catalogServiceClient = catalogServiceClient;
        this.modelMapper = modelMapper;
    }

    @Transactional
    public void addPlayHistory(UUID userId, PlayHistoryAddRequest request) {
        SongInternalResponse song;
        try {
            song = catalogServiceClient.getSongDetails(request.getSongId());
        } catch (FeignException.NotFound exception) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bài hát trên hệ thống");
        } catch (FeignException exception) {
            log.warn("Catalog lookup failed for song {} with status {}", request.getSongId(), exception.status());
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Không thể xác minh bài hát lúc này");
        }

        if (!"APPROVED".equals(song.getStatus())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Bài hát chưa được duyệt hoặc không khả dụng");
        }
        playHistoryRepository.save(PlayHistory.builder()
                .userId(userId).songId(request.getSongId()).songTitle(song.getTitle())
                .artistName(song.getOwnerName()).coverImage(song.getCoverImage())
                .durationListened(request.getDurationListened()).build());

        try {
            catalogServiceClient.incrementPlay(request.getSongId());
        } catch (RuntimeException exception) {
            log.error("Failed to synchronize play counter for song {}", request.getSongId(), exception);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể đồng bộ lượt nghe lúc này; vui lòng thử lại");
        }
    }

    @Transactional(readOnly = true)
    public Page<PlayHistoryResponse> getUserPlayHistory(UUID userId, Pageable pageable) {
        return playHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId, pageable)
                .map(history -> modelMapper.map(history, PlayHistoryResponse.class));
    }
}