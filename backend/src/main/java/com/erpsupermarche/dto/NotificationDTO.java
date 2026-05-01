package com.erpsupermarche.dto;

import com.erpsupermarche.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private String id;
    private String senderName;
    private UserRole senderRole;
    private UserRole targetRole;
    private String message;
    private LocalDateTime createdAt;
    private boolean read;
}
