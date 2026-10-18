package com.example.catalogservice.service;

import com.example.catalogservice.client.ArtistInternalResponse;
import com.example.catalogservice.client.ArtistServiceClient;
import com.example.catalogservice.exception.BadRequestException;
import com.example.catalogservice.exception.FileStorageException;
import com.example.catalogservice.exception.ResourceNotFoundException;
import com.example.catalogservice.exception.UnauthorizedAccessException;
import com.example.catalogservice.model.dto.request.*;
import com.example.catalogservice.model.dto.response.SongResponse;
import com.example.catalogservice.model.entity.*;
import com.example.catalogservice.repository.*;
import feign.FeignException;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SongService {
    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;
    private final LyricsRepository lyricsRepository;
    private final SongArtistRepository songArtistRepository;
    private final GenreRepository genreRepository;
    private final ArtistServiceClient artistServiceClient;
    private final CloudinaryService cloudinaryService;
    private final ModelMapper modelMapper;

    public SongService(SongRepository songRepository, AlbumRepository albumRepository,
                       LyricsRepository lyricsRepository, SongArtistRepository songArtistRepository,
                       GenreRepository genreRepository, ArtistServiceClient artistServiceClient,
                       CloudinaryService cloudinaryService, ModelMapper modelMapper) {
        this.songRepository = songRepository;
        this.albumRepository = albumRepository;
        this.lyricsRepository = lyricsRepository;
        this.songArtistRepository = songArtistRepository;
        this.genreRepository = genreRepository;
        this.artistServiceClient = artistServiceClient;
        this.cloudinaryService = cloudinaryService;
        this.modelMapper = modelMapper;
    }

    @Transactional
    public SongResponse uploadSong(SongUploadRequest request, UUID ownerId) {
        if (request.getAudioFile() == null || request.getAudioFile().isEmpty()) {
            throw new BadRequestException("File nhạc không được để trống");
        }
        Song song = modelMapper.map(request, Song.class);
        song.setOwnerId(ownerId);
        ArtistInternalResponse artist = artistServiceClient.getArtistById(ownerId);
        song.setOwnerName(artist.getStageName());
        song.setStatus("PENDING");
        song.setIsDeleted(false);
        song.setPlayCount(0);
        song.setLikeCount(0);

        if (request.getAlbumId() != null) {
            Album album = albumRepository.findById(request.getAlbumId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy album"));
            if (!album.getOwnerId().equals(ownerId)) {
                throw new UnauthorizedAccessException("Bạn không có quyền thêm bài hát vào album này");
            }
            if (!"PENDING".equals(album.getStatus())) {
                throw new BadRequestException("Chỉ được thêm bài hát vào album đang chờ duyệt");
            }
            song.setAlbum(album);
            if (request.getTrackNumber() == null) song.setTrackNumber((int) songRepository.countByAlbumId(album.getId()) + 1);
            album.setTotalTracks(album.getTotalTracks() + 1);
            albumRepository.save(album);
        }

        List<Genre> genres = genreRepository.findAllById(request.getGenreIds());
        if (genres.size() != request.getGenreIds().stream().distinct().count()) {
            throw new BadRequestException("Một hoặc nhiều thể loại âm nhạc không hợp lệ hoặc bị lặp");
        }
        song.setGenres(new HashSet<>(genres));
        try {
            Map<?, ?> audio = cloudinaryService.uploadAudio(request.getAudioFile());
            song.setAudioUrl((String) audio.get("secure_url"));
            song.setAudioPublicId((String) audio.get("public_id"));
            Object duration = audio.get("duration");
            song.setDurationSeconds(duration instanceof Number number ? number.intValue() : 0);
            if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
                Map<?, ?> cover = cloudinaryService.uploadImage(request.getCoverImage());
                song.setCoverImage((String) cover.get("secure_url"));
            }
        } catch (IOException exception) {
            throw new FileStorageException("Không thể tải file nhạc hoặc ảnh bìa lên kho lưu trữ", exception);
        }

        return modelMapper.map(songRepository.save(song), SongResponse.class);
    }

    @Transactional(readOnly = true)
    public Page<SongResponse> getSongsByOwner(UUID ownerId, Pageable pageable) {
        return songRepository.findByOwnerId(ownerId, pageable).map(song -> modelMapper.map(song, SongResponse.class));
    }

    @Transactional(readOnly = true)
    public Page<SongResponse> getSongsByStatus(String status, Pageable pageable) {
        return songRepository.findByStatusAndIsDeletedFalse(status, pageable).map(song -> modelMapper.map(song, SongResponse.class));
    }

    @Transactional
    public void updateSongStatus(UUID songId, String status) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài hát"));
        song.setStatus(status);
        songRepository.save(song);
        Album album = song.getAlbum();
        if ("APPROVED".equals(status) && album != null && songRepository.countByAlbumIdAndStatus(album.getId(), "APPROVED")
                == songRepository.countByAlbumId(album.getId())) {
            album.setStatus("APPROVED");
            albumRepository.save(album);
        }
    }

    @Transactional
    public void updateLyrics(UUID songId, LyricsUpdateRequest request, UUID artistId) {
        Song song = findOwnedSong(songId, artistId);
        Lyrics lyrics = lyricsRepository.findBySongId(songId).orElseGet(Lyrics::new);
        lyrics.setId(songId);
        lyrics.setSong(song);
        lyrics.setContent(request.getContent());
        lyrics.setLanguage(request.getLanguage());
        lyricsRepository.save(lyrics);
    }

    @Transactional
    public void addSongArtist(UUID songId, SongArtistAddRequest request, UUID artistId) {
        Song song = findOwnedSong(songId, artistId);
        if (song.getOwnerId().equals(request.getArtistId())) throw new BadRequestException("Không thể thêm chính mình làm nghệ sĩ phụ");
        if (!List.of("FEATURED", "PRODUCER").contains(request.getRole())) throw new BadRequestException("Role nghệ sĩ không hợp lệ");
        if (songArtistRepository.existsBySongIdAndArtistId(songId, request.getArtistId())) throw new BadRequestException("Nghệ sĩ này đã có trong bài hát");
        ArtistInternalResponse artist;
        try {
            artist = artistServiceClient.getArtistById(request.getArtistId());
        } catch (FeignException.NotFound exception) {
            throw new ResourceNotFoundException("Nghệ sĩ không tồn tại trong hệ thống");
        } catch (FeignException exception) {
            throw new BadRequestException("Không thể xác minh nghệ sĩ phụ với Artist Service");
        }
        SongArtist collaborator = new SongArtist();
        collaborator.setSong(song);
        collaborator.setArtistId(request.getArtistId());
        collaborator.setArtistName(artist.getStageName());
        collaborator.setRole(request.getRole());
        songArtistRepository.save(collaborator);
    }

    @Transactional
    public void addSongToAlbum(UUID albumId, AlbumSongAddRequest request, UUID artistId) {
        Album album = albumRepository.findById(albumId).orElseThrow(() -> new ResourceNotFoundException("Album không tồn tại"));
        if (!album.getOwnerId().equals(artistId)) throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa album này");
        if (!"PENDING".equals(album.getStatus())) throw new BadRequestException("Chỉ được chỉnh sửa album đang chờ duyệt");
        Song song = songRepository.findById(request.getSongId()).orElseThrow(() -> new ResourceNotFoundException("Bài hát không tồn tại"));
        if (!song.getOwnerId().equals(artistId)) throw new UnauthorizedAccessException("Bạn không có quyền thêm bài hát này");
        if (song.getAlbum() != null && song.getAlbum().getId().equals(albumId)) throw new BadRequestException("Bài hát đã nằm trong album này");
        if (song.getAlbum() != null) {
            Album previous = song.getAlbum();
            previous.setTotalTracks(Math.max(0, previous.getTotalTracks() - 1));
            albumRepository.save(previous);
        }
        song.setAlbum(album);
        album.setTotalTracks(album.getTotalTracks() + 1);
        song.setTrackNumber(request.getTrackNumber() == null ? album.getTotalTracks() : request.getTrackNumber());
        songRepository.save(song);
        albumRepository.save(album);
    }

    @Transactional
    public void reorderSongsInAlbum(UUID albumId, AlbumSongReorderRequest request, UUID artistId) {
        Album album = albumRepository.findById(albumId).orElseThrow(() -> new ResourceNotFoundException("Album không tồn tại"));
        if (!album.getOwnerId().equals(artistId)) throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa album này");
        if (!"PENDING".equals(album.getStatus())) throw new BadRequestException("Chỉ được chỉnh sửa album đang chờ duyệt");
        for (AlbumSongReorderRequest.SongOrder order : request.getSongOrders()) {
            Song song = songRepository.findById(order.getSongId()).orElseThrow(() -> new ResourceNotFoundException("Bài hát không tồn tại"));
            if (song.getAlbum() == null || !song.getAlbum().getId().equals(albumId)) throw new BadRequestException("Bài hát không thuộc album này");
            song.setTrackNumber(order.getTrackNumber());
        }
    }

    private Song findOwnedSong(UUID songId, UUID artistId) {
        Song song = songRepository.findById(songId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài hát"));
        if (!song.getOwnerId().equals(artistId)) throw new UnauthorizedAccessException("Bạn không có quyền cập nhật bài hát này");
        return song;
    }
}