package com.example.catalogservice.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mcmusic.sharedauth.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Set;

@Component
public class MultiIssuerJwtFilter extends OncePerRequestFilter {
    private final JwtTokenProvider userProvider;
    private final JwtTokenProvider artistProvider;
    private final JwtTokenProvider adminProvider;
    private final ObjectMapper mapper = new ObjectMapper();

    public MultiIssuerJwtFilter(@Qualifier("userJwtTokenProvider") JwtTokenProvider userProvider,
                                @Qualifier("artistJwtTokenProvider") JwtTokenProvider artistProvider,
                                @Qualifier("adminJwtTokenProvider") JwtTokenProvider adminProvider) {
        this.userProvider = userProvider;
        this.artistProvider = artistProvider;
        this.adminProvider = adminProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = bearerToken(request);
        if (token != null) {
            try {
                String issuer = readIssuer(token);
                JwtTokenProvider provider = switch (issuer == null ? "" : issuer) {
                    case "user-service" -> userProvider;
                    case "artist-service" -> artistProvider;
                    case "admin-service" -> adminProvider;
                    default -> null;
                };
                if (provider != null && provider.validateToken(token)) {
                    Claims claims = provider.getClaimsFromToken(token);
                    String role = claims.get("role", String.class);
                    if (role == null) role = switch (issuer) {
                        case "user-service" -> "USER";
                        case "artist-service" -> "ARTIST";
                        default -> "ADMIN";
                    };
                    role = role.replaceFirst("^ROLE_", "").toUpperCase();
                    Set<String> issuerRoles = switch (issuer) {
                        case "user-service" -> Set.of("USER");
                        case "artist-service" -> Set.of("ARTIST");
                        default -> Set.of("ADMIN", "SUPER_ADMIN");
                    };
                    if (issuerRoles.contains(role) && claims.getSubject() != null) {
                        var authentication = new UsernamePasswordAuthenticationToken(claims.getSubject(), null,
                                Set.of(new SimpleGrantedAuthority("ROLE_" + role)));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (RuntimeException | IOException ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }

    private String bearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return StringUtils.hasText(header) && header.startsWith("Bearer ") ? header.substring(7) : null;
    }

    private String readIssuer(String token) throws IOException {
        String[] parts = token.split("\\.");
        if (parts.length != 3) return null;
        JsonNode payload = mapper.readTree(Base64.getUrlDecoder().decode(parts[1]));
        return payload.hasNonNull("iss") ? payload.get("iss").asText() : null;
    }
}