package com.lucky.disasterguard.repository;

import com.lucky.disasterguard.entity.SosAlert;
import com.lucky.disasterguard.entity.SosStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SosAlertRepository extends JpaRepository<SosAlert, Long> {

    List<SosAlert> findByStatusOrderByTriggeredAtDesc(SosStatus status);

    List<SosAlert> findByUserIdOrderByTriggeredAtDesc(Long userId);

    @Query("SELECT s FROM SosAlert s WHERE s.status = 'PENDING' ORDER BY s.triggeredAt DESC")
    List<SosAlert> findAllPending();
}