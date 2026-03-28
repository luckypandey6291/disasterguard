package com.lucky.disasterguard.controller;

import com.lucky.disasterguard.dto.SosRequest;
import com.lucky.disasterguard.entity.SosAlert;
import com.lucky.disasterguard.service.SosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/sos")
@CrossOrigin(origins = "http://localhost:5173")
public class SosController {

    @Autowired
    private SosService sosService;

    // SOS trigger karo — civilian use karega
    @PostMapping("/trigger")
    public ResponseEntity<SosAlert> triggerSos(
            @RequestBody SosRequest request,
            @RequestHeader("Authorization") String token
    ) {
        SosAlert sos = sosService.triggerSos(request, token);
        return ResponseEntity.ok(sos);
    }

    // Saare pending SOS — responder use karega
    @GetMapping("/pending")
    public ResponseEntity<List<SosAlert>> getPending() {
        return ResponseEntity.ok(sosService.getAllPending());
    }

    // Mera SOS history — civilian use karega
    @GetMapping("/my")
    public ResponseEntity<List<SosAlert>> getMySos(
            @RequestHeader("Authorization") String token
    ) {
        return ResponseEntity.ok(sosService.getUserSos(token));
    }

    // SOS assign karo — responder use karega
    @PutMapping("/{id}/assign")
    public ResponseEntity<SosAlert> assignSos(@PathVariable Long id) {
        return ResponseEntity.ok(sosService.assignSos(id));
    }

    // SOS resolve karo — responder use karega
    @PutMapping("/{id}/resolve")
    public ResponseEntity<SosAlert> resolveSos(@PathVariable Long id) {
        return ResponseEntity.ok(sosService.resolveSos(id));
    }
}
