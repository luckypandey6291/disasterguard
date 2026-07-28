package com.lucky.disasterguard.service;

import com.lucky.disasterguard.dto.IncidentRequest;
import com.lucky.disasterguard.entity.*;
import com.lucky.disasterguard.repository.IncidentRepository;
import com.lucky.disasterguard.repository.UserRepository;
import com.lucky.disasterguard.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

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

    public Incident createIncident(IncidentRequest request, String token) {
        User user = getAuthenticatedUser(token);

        Incident incident = new Incident();
        incident.setTitle(request.getTitle());
        incident.setType(request.getType());
        incident.setSeverity(IncidentSeverity.valueOf(request.getSeverity()));
        incident.setLatitude(request.getLatitude());
        incident.setLongitude(request.getLongitude());
        incident.setLocationName(request.getLocationName());
        incident.setDescription(request.getDescription());
        incident.setAiConfidence(request.getAiConfidence());
        incident.setReportedBy(user);

        Incident saved = incidentRepository.save(incident);

        // 1. WebSocket broadcast
        messagingTemplate.convertAndSend("/topic/incidents", saved);

        // 2. FCM Push Notification to all users
        try {
            fcmNotificationService.sendToAll(
                    "⚠️ New Disaster Alert: " + saved.getTitle(),
                    (saved.getLocationName() != null ? "Location: " + saved.getLocationName() + " — " : "") + saved.getSeverity() + " severity incident reported.",
                    "INCIDENT_ALERT",
                    java.util.Map.of("incidentId", saved.getId().toString())
            );
        } catch (Exception e) {
            System.err.println("FCM Incident Notification error: " + e.getMessage());
        }

        return saved;
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAllByOrderByOccurredAtDesc();
    }

    public List<Incident> getActiveIncidents() {
        return incidentRepository.findByStatusOrderByOccurredAtDesc(
                IncidentStatus.ACTIVE
        );
    }

    public Incident resolveIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        incident.setStatus(IncidentStatus.RESOLVED);
        return incidentRepository.save(incident);
    }
}