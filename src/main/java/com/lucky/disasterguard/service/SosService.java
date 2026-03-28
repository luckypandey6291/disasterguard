package com.lucky.disasterguard.service;

import com.lucky.disasterguard.dto.SosRequest;
import com.lucky.disasterguard.entity.SosAlert;
import com.lucky.disasterguard.entity.SosStatus;
import com.lucky.disasterguard.entity.User;
import com.lucky.disasterguard.repository.SosAlertRepository;
import com.lucky.disasterguard.repository.UserRepository;
import com.lucky.disasterguard.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
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

    // SOS trigger karna
    public SosAlert triggerSos(SosRequest request, String token) {
        // Token se email nikalo
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));

        // User dhundo
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // SOS alert banao
        SosAlert sos = new SosAlert();
        sos.setUser(user);
        sos.setLatitude(request.getLatitude());
        sos.setLongitude(request.getLongitude());
        sos.setEmergencyType(
                request.getEmergencyType() != null ? request.getEmergencyType() : "GENERAL"
        );

        return sosAlertRepository.save(sos);
    }

    // Saare pending SOS fetch karna (responders ke liye)
    public List<SosAlert> getAllPending() {
        return sosAlertRepository.findAllPending();
    }

    // Specific user ke SOS fetch karna
    public List<SosAlert> getUserSos(String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return sosAlertRepository.findByUserIdOrderByTriggeredAtDesc(user.getId());
    }

    // SOS resolve karna
    public SosAlert resolveSos(Long sosId) {
        SosAlert sos = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS not found"));
        sos.setStatus(SosStatus.RESOLVED);
        return sosAlertRepository.save(sos);
    }

    // SOS assign karna responder ko
    public SosAlert assignSos(Long sosId) {
        SosAlert sos = sosAlertRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS not found"));
        sos.setStatus(SosStatus.ASSIGNED);
        return sosAlertRepository.save(sos);
    }
}
