package com.example.usersservice;

import com.example.usersservice.client.ArtistInternalResponse;
import com.example.usersservice.client.ArtistServiceClient;
import com.example.usersservice.client.CatalogServiceClient;
import com.example.usersservice.client.SongInternalResponse;
import com.example.usersservice.exception.ApiException;
import com.example.usersservice.model.dto.request.PlayHistoryAddRequest;
import com.example.usersservice.model.entity.Favorite;
import com.example.usersservice.model.entity.FavoriteAlbum;
import com.example.usersservice.model.entity.FavoriteId;
import com.example.usersservice.model.entity.FollowArtist;
import com.example.usersservice.model.entity.PlayHistory;
import com.example.usersservice.repository.FavoriteAlbumRepository;
import com.example.usersservice.repository.FavoriteRepository;
import com.example.usersservice.repository.FollowArtistRepository;
import com.example.usersservice.repository.PlayHistoryRepository;
import com.example.usersservice.service.FavoriteService;
import com.example.usersservice.service.FollowArtistService;
import com.example.usersservice.service.PlayHistoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserEngagementServiceTests {
    @Mock private FavoriteRepository favoriteRepository;
    @Mock private FavoriteAlbumRepository favoriteAlbumRepository;
    @Mock private FollowArtistRepository followArtistRepository;
    @Mock private PlayHistoryRepository playHistoryRepository;
    @Mock private CatalogServiceClient catalogServiceClient;
    @Mock private ArtistServiceClient artistServiceClient;
    @Mock private ModelMapper modelMapper;

    @Test
    void addsPlayHistoryAndIncrementsCatalogCounterForApprovedSong() {
        UUID userId = UUID.randomUUID();
        UUID songId = UUID.randomUUID();
        SongInternalResponse song = new SongInternalResponse();
        song.setTitle("Track");
        song.setOwnerName("Artist");
        song.setCoverImage("cover");
        song.setStatus("APPROVED");
        when(catalogServiceClient.getSongDetails(songId)).thenReturn(song);
        PlayHistoryService service = new PlayHistoryService(playHistoryRepository, catalogServiceClient, modelMapper);
        PlayHistoryAddRequest request = new PlayHistoryAddRequest();
        request.setSongId(songId);
        request.setDurationListened(30);

        service.addPlayHistory(userId, request);

        ArgumentCaptor<PlayHistory> history = ArgumentCaptor.forClass(PlayHistory.class);
        verify(playHistoryRepository).save(history.capture());
        assertEquals(userId, history.getValue().getUserId());
        assertEquals(songId, history.getValue().getSongId());
        assertEquals("Track", history.getValue().getSongTitle());
        assertEquals(30, history.getValue().getDurationListened());
        verify(catalogServiceClient).incrementPlay(songId);
    }

    @Test
    void rejectsFavoriteWhenSongIsNotApproved() {
        UUID userId = UUID.randomUUID();
        UUID songId = UUID.randomUUID();
        SongInternalResponse song = new SongInternalResponse();
        song.setStatus("PENDING");
        when(favoriteRepository.existsById(new FavoriteId(userId, songId))).thenReturn(false);
        when(catalogServiceClient.getSongDetails(songId)).thenReturn(song);
        FavoriteService service = new FavoriteService(favoriteRepository, favoriteAlbumRepository,
                catalogServiceClient, modelMapper);

        assertThrows(ApiException.class, () -> service.addFavorite(userId, songId));

        verify(favoriteRepository, never()).save(any(Favorite.class));
        verify(catalogServiceClient, never()).incrementLike(songId);
    }

    @Test
    void followsActiveArtistAndIncrementsFollowerCounter() {
        UUID userId = UUID.randomUUID();
        UUID artistId = UUID.randomUUID();
        ArtistInternalResponse artist = new ArtistInternalResponse();
        artist.setStageName("Stage");
        artist.setAvatarUrl("avatar");
        artist.setIsActive(true);
        when(followArtistRepository.existsById(any())).thenReturn(false);
        when(artistServiceClient.getArtistDetails(artistId)).thenReturn(artist);
        FollowArtistService service = new FollowArtistService(followArtistRepository, artistServiceClient, modelMapper);

        service.followArtist(userId, artistId);

        ArgumentCaptor<FollowArtist> follow = ArgumentCaptor.forClass(FollowArtist.class);
        verify(followArtistRepository).save(follow.capture());
        assertEquals(userId, follow.getValue().getUserId());
        assertEquals(artistId, follow.getValue().getArtistId());
        assertEquals("Stage", follow.getValue().getArtistName());
        verify(artistServiceClient).incrementFollowerCount(artistId);
    }

    @Test
    void duplicateFavoriteIsRejectedBeforeRemoteCalls() {
        UUID userId = UUID.randomUUID();
        UUID songId = UUID.randomUUID();
        when(favoriteRepository.existsById(new FavoriteId(userId, songId))).thenReturn(true);
        FavoriteService service = new FavoriteService(favoriteRepository, favoriteAlbumRepository,
                catalogServiceClient, modelMapper);

        assertThrows(ApiException.class, () -> service.addFavorite(userId, songId));

        verify(catalogServiceClient, never()).getSongDetails(songId);
        verify(catalogServiceClient, never()).incrementLike(songId);
    }
}