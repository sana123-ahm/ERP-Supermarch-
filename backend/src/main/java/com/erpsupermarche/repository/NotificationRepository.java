package com.erpsupermarche.repository;

import com.erpsupermarche.entity.Notification;
import com.erpsupermarche.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(UserRole role);
    List<Notification> findBySenderRoleOrTargetRoleOrderByCreatedAtDesc(UserRole senderRole, UserRole targetRole);
}
