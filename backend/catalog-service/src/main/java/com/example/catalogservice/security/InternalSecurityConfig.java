package com.example.catalogservice.security;

import com.mcmusic.sharedauth.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class InternalSecurityConfig {
    @Value("${jwt.secret.user}")
    private String userSecret;
    @Value("${jwt.secret.artist}")
    private String artistSecret;
    @Value("${jwt.secret.admin}")
    private String adminSecret;

    @Bean
    public JwtTokenProvider userJwtTokenProvider() {
        return new JwtTokenProvider(userSecret, 0, 0, "user-service");
    }

    @Bean
    public JwtTokenProvider artistJwtTokenProvider() {
        return new JwtTokenProvider(artistSecret, 0, 0, "artist-service");
    }

    @Bean
    public JwtTokenProvider adminJwtTokenProvider() {
        return new JwtTokenProvider(adminSecret, 0, 0, "admin-service");
    }

    @Bean
    public SecurityFilterChain catalogSecurityFilterChain(HttpSecurity http, InternalApiFilter internalApiFilter,
                                                           MultiIssuerJwtFilter jwtFilter) throws Exception {
        return http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/catalog/public/**", "/error").permitAll()
                        .requestMatchers("/api/internal/catalog/**").permitAll()
                        .requestMatchers("/api/catalog/artist/**").hasRole("ARTIST")
                        .requestMatchers("/api/catalog/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> writeSecurityError(response,
                                HttpServletResponse.SC_UNAUTHORIZED, "Xác thực thất bại, token không hợp lệ hoặc không được cung cấp"))
                        .accessDeniedHandler((request, response, exception) -> writeSecurityError(response,
                                HttpServletResponse.SC_FORBIDDEN, "Không có quyền truy cập vào tài nguyên này")))
                .addFilterBefore(internalApiFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174",
                "http://localhost:5175", "https://your-production-domain.com"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private void writeSecurityError(HttpServletResponse response, int status, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"statusCode\":" + status + ",\"message\":\"" + message
                + "\",\"data\":null,\"timestamp\":\"" + java.time.Instant.now() + "\"}");
    }
}