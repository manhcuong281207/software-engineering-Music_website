package com.example.usersservice.model.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.UUID;

@Data
public class PlayHistoryAddRequest {
    @NotNull(message = "ID bài hát không được để trống")
    private UUID songId;

    @PositiveOrZero(message = "Thời lượng đã nghe không được âm")
    private Integer durationListened;
}