package com.example.usersservice.controller;

import com.example.usersservice.exception.ApiException;
import com.example.usersservice.model.dto.request.PlayHistoryAddRequest;
import com.example.usersservice.model.dto.response.ApiResponse;
import com.example.usersservice.model.dto.response.PlayHistoryResponse;
import com.example.usersservice.service.PlayHistoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/user/history")
@PreAuthorize("hasRole('USER')")
public class PlayHistoryController {
    private final PlayHistoryService playHistoryService;

    public PlayHistoryController(PlayHistoryService playHistoryService) {
        this.playHistoryService = playHistoryService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addPlayHistory(@Valid @RequestBody PlayHistoryAddRequest request,
                                                            Authentication authentication) {
        playHistoryService.addPlayHistory(currentUserId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(null, "Đã ghi nhận lịch sử nghe nhạc"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PlayHistoryResponse>>> getUserPlayHistory(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        if (page < 0 || size < 1 || size > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tham số phân trang không hợp lệ");
        }
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(
                playHistoryService.getUserPlayHistory(currentUserId(authentication), pageable),
                "Lấy lịch sử nghe nhạc thành công"));
    }

    private UUID currentUserId(Authentication authentication) {
        try {
            return UUID.fromString(authentication.getName());
        } catch (RuntimeException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token người dùng không hợp lệ");
        }
    }
}