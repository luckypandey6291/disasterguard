package com.lucky.disasterguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sos_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SosAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Double latitude;
    private Double longitude;
    private String locationName;

    @Enumerated(EnumType.STRING)
    private SosStatus status;

    private String emergencyType;

    private LocalDateTime triggeredAt;
    private LocalDateTime resolvedAt;

    @PrePersist
    public void prePersist() {
        this.triggeredAt = LocalDateTime.now();
        this.status = SosStatus.PENDING;
    }
}