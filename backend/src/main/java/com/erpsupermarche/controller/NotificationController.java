package com.erpsupermarche.controller;

import com.erpsupermarche.dto.NotificationDTO;
import com.erpsupermarche.entity.UserRole;
import com.erpsupermarche.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationDTO> send(@RequestBody NotificationDTO dto) {
        return ResponseEntity.ok(notificationService.sendNotification(dto));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<NotificationDTO>> getByRole(@PathVariable UserRole role) {
        return ResponseEntity.ok(notificationService.getNotificationsForRole(role));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all/{senderRole}/{targetRole}")
    public ResponseEntity<Void> markAllRead(@PathVariable UserRole senderRole, @PathVariable UserRole targetRole) {
        notificationService.markAllAsReadForRole(senderRole, targetRole);
        return ResponseEntity.noContent().build();
    }
}
