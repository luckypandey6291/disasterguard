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

    public SosAlert triggerSos(SosRequest request, String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SosAlert sos = new SosAlert();
        sos.setUser(user);
        sos.setLatitude(request.getLatitude());
        sos.setLongitude(request.getLongitude());
        sos.setEmergencyType(
                request.getEmergencyType() != null ? request.getEmergencyType() : "GENERAL"
        );

        SosAlert saved = sosAlertRepository.save(sos);

        // WebSocket se saare responders ko notify karo
        messagingTemplate.convertAndSend("/topic/sos", saved);

        return saved;
    }

    public List<SosAlert> getAllPending() {
        return sosAlertRepository.findAllPending();
    }

    public List<SosAlert> getUserSos(String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return sosAlertRepository.findByUserIdOrderByTriggeredAtDesc(user.getId());
    }

    public SosAlert resolveSos(Long sosId) {
        SosAlert sos = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS not found"));
        sos.setStatus(SosStatus.RESOLVED);
        SosAlert saved = sosAlertRepository.save(sos);
        messagingTemplate.convertAndSend("/topic/sos-update", saved);
        return saved;
    }

    public SosAlert assignSos(Long sosId) {
        SosAlert sos = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS not found"));
        sos.setStatus(SosStatus.ASSIGNED);
        SosAlert saved = sosAlertRepository.save(sos);
        messagingTemplate.convertAndSend("/topic/sos-update", saved);
        return saved;
    }
}
