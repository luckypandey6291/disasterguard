package com.lucky.disasterguard.controller;

import com.lucky.disasterguard.dto.AuthResponse;
import com.lucky.disasterguard.dto.LoginRequest;
import com.lucky.disasterguard.entity.User;
import com.lucky.disasterguard.repository.UserRepository;
import com.lucky.disasterguard.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already registered"));
        }
        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(
                saved.getEmail(), saved.getRole().toString()
        );
        return ResponseEntity.ok(
                new AuthResponse(token, saved.getId(), saved.getName(),
                        saved.getEmail(), saved.getRole())
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return userRepository.findByEmail(req.getEmail())
                .filter(u -> u.getPassword() != null &&
                        u.getPassword().equals(req.getPassword()))
                .map(u -> {
                    String token = jwtUtil.generateToken(
                            u.getEmail(), u.getRole().toString()
                    );
                    return ResponseEntity.ok(
                            new AuthResponse(token, u.getId(), u.getName(),
                                    u.getEmail(), u.getRole())
                    );
                })
                .orElse(ResponseEntity.status(401).body(null));
    }
}