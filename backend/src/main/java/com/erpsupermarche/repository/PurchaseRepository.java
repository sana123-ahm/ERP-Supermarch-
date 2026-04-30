package com.erpsupermarche.repository;

import com.erpsupermarche.entity.Purchase;
import com.erpsupermarche.entity.PurchaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, String> {
    List<Purchase> findByStatus(PurchaseStatus status);
    List<Purchase> findBySupplierId(String supplierId);
    List<Purchase> findByPurchaseDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Purchase> findByCreatedById(String userId);
}
