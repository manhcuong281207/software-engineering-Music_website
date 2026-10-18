package com.example.catalogservice.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Data
public class SongUploadRequest {
    @NotBlank(message = "Tên bài hát là bắt buộc")
    private String title;
    private UUID albumId;
    private Integer trackNumber;
    @NotNull(message = "File nhạc là bắt buộc")
    private MultipartFile audioFile;
    private MultipartFile coverImage;
    private Boolean explicit = false;
    @NotEmpty(message = "Phải chọn ít nhất một thể loại âm nhạc")
    private List<UUID> genreIds;
}