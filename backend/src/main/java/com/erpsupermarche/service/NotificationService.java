package com.erpsupermarche.service;

import com.erpsupermarche.dto.NotificationDTO;
import com.erpsupermarche.entity.Notification;
import com.erpsupermarche.entity.UserRole;
import com.erpsupermarche.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public NotificationDTO sendNotification(NotificationDTO dto) {
        Notification notification = Notification.builder()
                .senderName(dto.getSenderName())
                .senderRole(dto.getSenderRole())
                .targetRole(dto.getTargetRole())
                .message(dto.getMessage())
                .build();
        
        Notification saved = notificationRepository.save(notification);
        return convertToDTO(saved);
    }

    public List<NotificationDTO> getNotificationsForRole(UserRole role) {
        return notificationRepository.findBySenderRoleOrTargetRoleOrderByCreatedAtDesc(role, role)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsReadForRole(UserRole senderRole, UserRole targetRole) {
        List<Notification> unread = notificationRepository.findBySenderRoleOrTargetRoleOrderByCreatedAtDesc(senderRole, targetRole)
                .stream()
                .filter(n -> n.getSenderRole() == senderRole && n.getTargetRole() == targetRole && !n.isRead())
                .collect(Collectors.toList());
        
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationDTO convertToDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .senderName(n.getSenderName())
                .senderRole(n.getSenderRole())
                .targetRole(n.getTargetRole())
                .message(n.getMessage())
                .createdAt(n.getCreatedAt())
                .isRead(n.isRead())
                .build();
    }
}
