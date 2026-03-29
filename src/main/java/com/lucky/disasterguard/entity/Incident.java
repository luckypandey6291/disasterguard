package com.lucky.disasterguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String type;

    @Enumerated(EnumType.STRING)
    private IncidentSeverity severity;

    @Enumerated(EnumType.STRING)
    private IncidentStatus status;

    private Double latitude;
    private Double longitude;
    private String locationName;

    private String description;
    private Double aiConfidence;

    @ManyToOne
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    private LocalDateTime occurredAt;
    private LocalDateTime resolvedAt;

    @PrePersist
    public void prePersist() {
        this.occurredAt = LocalDateTime.now();
        this.status = IncidentStatus.ACTIVE;
    }
}
