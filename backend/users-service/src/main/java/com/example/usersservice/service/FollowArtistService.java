package com.example.usersservice.service;

import com.example.usersservice.client.ArtistInternalResponse;
import com.example.usersservice.client.ArtistServiceClient;
import com.example.usersservice.exception.ApiException;
import com.example.usersservice.model.dto.response.FollowArtistResponse;
import com.example.usersservice.model.entity.FollowArtist;
import com.example.usersservice.model.entity.FollowArtistId;
import com.example.usersservice.repository.FollowArtistRepository;
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
public class FollowArtistService {
    private static final Logger log = LoggerFactory.getLogger(FollowArtistService.class);

    private final FollowArtistRepository followArtistRepository;
    private final ArtistServiceClient artistServiceClient;
    private final ModelMapper modelMapper;

    public FollowArtistService(FollowArtistRepository followArtistRepository, ArtistServiceClient artistServiceClient,
                               ModelMapper modelMapper) {
        this.followArtistRepository = followArtistRepository;
        this.artistServiceClient = artistServiceClient;
        this.modelMapper = modelMapper;
    }

    @Transactional
    public void followArtist(UUID userId, UUID artistId) {
        FollowArtistId id = new FollowArtistId(userId, artistId);
        if (followArtistRepository.existsById(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Đã theo dõi nghệ sĩ này");
        }

        ArtistInternalResponse artist;
        try {
            artist = artistServiceClient.getArtistDetails(artistId);
        } catch (FeignException.NotFound exception) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy nghệ sĩ trên hệ thống");
        } catch (FeignException exception) {
            log.warn("Artist lookup failed for {} with status {}", artistId, exception.status());
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Không thể xác minh nghệ sĩ lúc này");
        }
        if (!Boolean.TRUE.equals(artist.getIsActive())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Nghệ sĩ không tồn tại hoặc không hoạt động");
        }

        followArtistRepository.save(FollowArtist.builder()
                .userId(userId).artistId(artistId).artistName(artist.getStageName())
                .avatarUrl(artist.getAvatarUrl()).build());
        synchronizeFollowerCount(artistId, true);
    }

    @Transactional
    public void unfollowArtist(UUID userId, UUID artistId) {
        FollowArtistId id = new FollowArtistId(userId, artistId);
        if (!followArtistRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Chưa theo dõi nghệ sĩ này");
        }
        followArtistRepository.deleteById(id);
        synchronizeFollowerCount(artistId, false);
    }

    @Transactional(readOnly = true)
    public Page<FollowArtistResponse> getUserFollowedArtists(UUID userId, Pageable pageable) {
        return followArtistRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(follow -> modelMapper.map(follow, FollowArtistResponse.class));
    }

    private void synchronizeFollowerCount(UUID artistId, boolean increment) {
        try {
            if (increment) artistServiceClient.incrementFollowerCount(artistId);
            else artistServiceClient.decrementFollowerCount(artistId);
        } catch (RuntimeException exception) {
            log.error("Failed to synchronize follower counter for artist {}", artistId, exception);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể đồng bộ lượt theo dõi lúc này; vui lòng thử lại");
        }
    }
}