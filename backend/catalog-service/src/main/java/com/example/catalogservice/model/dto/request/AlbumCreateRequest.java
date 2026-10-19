package com.example.catalogservice.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
public class AlbumCreateRequest {
    @NotBlank(message = "Tên album là bắt buộc")
    private String title;
    private String albumType;
    private String description;
    private MultipartFile coverImage;
    private LocalDate releaseDate;
}