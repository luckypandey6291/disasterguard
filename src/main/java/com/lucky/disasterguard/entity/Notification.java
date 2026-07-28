package com.lucky.disasterguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String title;

    private String message;

    private String type; // e.g. SOS_ALERT, SOS_ASSIGNED, SOS_RESOLVED, INCIDENT_ALERT

    private boolean readStatus = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
