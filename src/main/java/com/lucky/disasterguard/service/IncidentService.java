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

    public Incident createIncident(IncidentRequest request, String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

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

        // WebSocket se broadcast karo
        messagingTemplate.convertAndSend("/topic/incidents", saved);

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