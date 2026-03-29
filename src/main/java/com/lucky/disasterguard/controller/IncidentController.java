package com.lucky.disasterguard.controller;

import com.lucky.disasterguard.dto.IncidentRequest;
import com.lucky.disasterguard.entity.Incident;
import com.lucky.disasterguard.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/incidents")
@CrossOrigin(origins = "http://localhost:5173")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @PostMapping
    public ResponseEntity<Incident> create(
            @RequestBody IncidentRequest request,
            @RequestHeader("Authorization") String token
    ) {
        return ResponseEntity.ok(incidentService.createIncident(request, token));
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAll() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Incident>> getActive() {
        return ResponseEntity.ok(incidentService.getActiveIncidents());
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Incident> resolve(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.resolveIncident(id));
    }
}
