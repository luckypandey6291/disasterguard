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

    @PostMapping("/sync")
    public ResponseEntity<?> syncFirebaseUser(@RequestBody Map<String, Object> payload) {
        String firebaseUid = (String) payload.get("firebaseUid");
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        String phone = (String) payload.get("phone");
        String requestedRoleStr = (String) payload.get("role");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        User user = userRepository.findByFirebaseUid(firebaseUid)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name != null ? name : email.split("@")[0]);
                    newUser.setPhone(phone);
                    newUser.setFirebaseUid(firebaseUid);

                    // Public self-registration restriction
                    com.lucky.disasterguard.entity.Role role = com.lucky.disasterguard.entity.Role.CIVILIAN;
                    if (requestedRoleStr != null) {
                        try {
                            com.lucky.disasterguard.entity.Role reqRole = com.lucky.disasterguard.entity.Role.valueOf(requestedRoleStr);
                            if (reqRole != com.lucky.disasterguard.entity.Role.ADMIN) {
                                role = reqRole;
                            }
                        } catch (Exception ignored) {}
                    }
                    newUser.setRole(role);
                    return newUser;
                });

        if (firebaseUid != null && (user.getFirebaseUid() == null || !user.getFirebaseUid().equals(firebaseUid))) {
            user.setFirebaseUid(firebaseUid);
        }
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        if (phone != null && !phone.isBlank()) {
            user.setPhone(phone);
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "name", saved.getName(),
                "email", saved.getEmail(),
                "role", saved.getRole(),
                "firebaseUid", saved.getFirebaseUid() != null ? saved.getFirebaseUid() : ""
        ));
    }

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