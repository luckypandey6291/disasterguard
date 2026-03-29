package com.lucky.disasterguard.repository;

import com.lucky.disasterguard.entity.Incident;
import com.lucky.disasterguard.entity.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatusOrderByOccurredAtDesc(IncidentStatus status);
    List<Incident> findAllByOrderByOccurredAtDesc();
}