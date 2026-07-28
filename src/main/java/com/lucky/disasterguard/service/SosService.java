package com.lucky.disasterguard.service;

import com.lucky.disasterguard.dto.SosRequest;
import com.lucky.disasterguard.entity.SosAlert;
import com.lucky.disasterguard.entity.SosStatus;
import com.lucky.disasterguard.entity.User;
import com.lucky.disasterguard.repository.SosAlertRepository;
import com.lucky.disasterguard.repository.UserRepository;
import com.lucky.disasterguard.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SosService {

    @Autowired
    private SosAlertRepository sosAlertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private FcmNotificationService fcmNotificationService;

    private User getAuthenticatedUser(String token) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        if (token != null && !token.isBlank()) {
            try {
                String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
                return userRepository.findByEmail(email).orElse(null);
            } catch (Exception ignored) {}
        }
        throw new RuntimeException("Authenticated user not found");
    }

    public SosAlert triggerSos(SosRequest request, String token) {
        User user = getAuthenticatedUser(token);

        SosAlert sos = new SosAlert();
        sos.setUser(user);
        sos.setLatitude(request.getLatitude());
        sos.setLongitude(request.getLongitude());
        sos.setEmergencyType(
                request.getEmergencyType() != null ? request.getEmergencyType() : "GENERAL"
        );

        SosAlert saved = sosAlertRepository.save(sos);

        // 1. STOMP WebSocket broadcast
        messagingTemplate.convertAndSend("/topic/sos", saved);

        // 2. FCM Push notification to Responders
        try {
            fcmNotificationService.sendToRole(
                    com.lucky.disasterguard.entity.Role.RESPONDER,
                    "🚨 Emergency SOS Alert",
                    "New " + saved.getEmergencyType() + " SOS from " + (user.getName() != null ? user.getName() : "Citizen"),
                    "SOS_ALERT",
                    java.util.Map.of("sosId", saved.getId().toString())
            );
        } catch (Exception e) {
            System.err.println("FCM SOS Trigger error: " + e.getMessage());
        }

        return saved;
    }

    public List<SosAlert> getAllPending() {
        return sosAlertRepository.findAllPending();
    }

    public List<SosAlert> getUserSos(String token) {
        User user = getAuthenticatedUser(token);
        return sosAlertRepository.findByUserIdOrderByTriggeredAtDesc(user.getId());
    }

    public SosAlert resolveSos(Long sosId) {
        SosAlert sos = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS not found"));
        sos.setStatus(SosStatus.RESOLVED);
        SosAlert saved = sosAlertRepository.save(sos);
        messagingTemplate.convertAndSend("/topic/sos-update", saved);

        try {
            fcmNotificationService.sendToUser(
                    sos.getUser(),
                    "✅ SOS Alert Resolved",
                    "Your SOS emergency request has been safely resolved.",
                    "SOS_RESOLVED",
                    java.util.Map.of("sosId", saved.getId().toString())
            );
        } catch (Exception e) {
            System.err.println("FCM SOS Resolve error: " + e.getMessage());
        }

        return saved;
    }

    public SosAlert assignSos(Long sosId) {
        SosAlert sos = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS not found"));
        sos.setStatus(SosStatus.ASSIGNED);
        SosAlert saved = sosAlertRepository.save(sos);
        messagingTemplate.convertAndSend("/topic/sos-update", saved);

        try {
            fcmNotificationService.sendToUser(
                    sos.getUser(),
                    "🚑 Rescue Team Dispatched",
                    "A responder team has been assigned to your SOS emergency alert.",
                    "SOS_ASSIGNED",
                    java.util.Map.of("sosId", saved.getId().toString())
            );
        } catch (Exception e) {
            System.err.println("FCM SOS Assign error: " + e.getMessage());
        }

        return saved;
    }
}
