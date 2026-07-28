package com.lucky.disasterguard.controller;

import com.lucky.disasterguard.entity.Notification;
import com.lucky.disasterguard.entity.User;
import com.lucky.disasterguard.entity.UserDevice;
import com.lucky.disasterguard.repository.NotificationRepository;
import com.lucky.disasterguard.repository.UserDeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private UserDeviceRepository userDeviceRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        throw new RuntimeException("User not authenticated");
    }

    @PostMapping("/devices")
    public ResponseEntity<?> registerDevice(@RequestBody Map<String, String> body) {
        String fcmToken = body.get("fcmToken");
        String deviceType = body.getOrDefault("deviceType", "WEB");

        if (fcmToken == null || fcmToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "fcmToken is required"));
        }

        User user = getAuthenticatedUser();
        Optional<UserDevice> existing = userDeviceRepository.findByFcmToken(fcmToken);

        UserDevice device;
        if (existing.isPresent()) {
            device = existing.get();
            device.setUser(user);
            device.setActive(true);
            device.setLastSeenAt(LocalDateTime.now());
        } else {
            device = new UserDevice();
            device.setUser(user);
            device.setFcmToken(fcmToken);
            device.setDeviceType(deviceType);
            device.setActive(true);
        }

        userDeviceRepository.save(device);
        return ResponseEntity.ok(Map.of("status", "registered", "fcmToken", fcmToken));
    }

    @DeleteMapping("/devices")
    public ResponseEntity<?> unregisterDevice(@RequestBody Map<String, String> body) {
        String fcmToken = body.get("fcmToken");
        if (fcmToken != null) {
            userDeviceRepository.findByFcmToken(fcmToken).ifPresent(d -> {
                d.setActive(false);
                userDeviceRepository.save(d);
            });
        }
        return ResponseEntity.ok(Map.of("status", "unregistered"));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setReadStatus(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(Map.of("status", "updated"));
    }
}
