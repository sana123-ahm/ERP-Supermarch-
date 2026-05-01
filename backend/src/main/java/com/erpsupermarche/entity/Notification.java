package com.erpsupermarche.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String senderName;
    
    @Enumerated(EnumType.STRING)
    private UserRole senderRole;
    
    @Enumerated(EnumType.STRING)
    private UserRole targetRole;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime createdAt;
    
    private boolean isRead;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isRead = false;
    }
}
