package com.example.usersservice.controller;

import com.example.usersservice.exception.ApiException;
import com.example.usersservice.model.entity.User;
import com.example.usersservice.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/users")
public class InternalUserController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("email", "fullName", "createdAt");
    private final UserRepository userRepository;

    public InternalUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Page<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        String[] parts = sort.split(",");
        String field = ALLOWED_SORT_FIELDS.contains(parts[0].trim()) ? parts[0].trim() : "createdAt";
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, field));
        return ResponseEntity.ok(userRepository.findAll(pageable).map(this::toInternalMap));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(toInternalMap(userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + id))));
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Void> updateUserStatus(@PathVariable UUID id, @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("isActive");
        if (active == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Trường 'isActive' là bắt buộc");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + id));
        user.setIsActive(active);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    private Map<String, Object> toInternalMap(User user) {
        return Map.of("id", user.getId(), "email", user.getEmail(), "fullName", user.getFullName(),
                "avatarUrl", user.getAvatarUrl() == null ? "" : user.getAvatarUrl(),
                "isActive", user.getIsActive(), "createdAt", user.getCreatedAt());
    }
}