package com.example.catalogservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalApiFilter extends OncePerRequestFilter {
    @Value("${internal.api.secret}")
    private String internalApiSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (request.getRequestURI().startsWith("/api/internal/")) {
            String suppliedSecret = request.getHeader("X-Internal-Secret");
            if (suppliedSecret == null || !suppliedSecret.equals(internalApiSecret)) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"success\":false,\"statusCode\":403,\"message\":\"Missing or invalid internal API secret\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}