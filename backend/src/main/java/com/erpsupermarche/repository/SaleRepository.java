package com.erpsupermarche.repository;

import com.erpsupermarche.entity.Sale;
import com.erpsupermarche.entity.SaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, String> {
    Optional<Sale> findByReceiptNumber(String receiptNumber);
    List<Sale> findByCashierId(String cashierId);
    List<Sale> findByStatus(SaleStatus status);
    List<Sale> findBySaleDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
