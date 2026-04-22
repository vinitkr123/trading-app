package com.tradingapp.service;

import com.tradingapp.dto.AuthRequest;
import com.tradingapp.model.User;
import com.tradingapp.repository.UserRepository;
import com.tradingapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.trading.initial-cash}")
    private BigDecimal initialCash;

    public Map<String, Object> register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .cashBalance(initialCash)
            .build();
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId());
        return Map.of("token", token, "user", toUserMap(user));
    }

    public Map<String, Object> login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getId());
        return Map.of("token", token, "user", toUserMap(user));
    }

    public Map<String, Object> toUserMap(User user) {
        return Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "cashBalance", user.getCashBalance()
        );
    }
}
