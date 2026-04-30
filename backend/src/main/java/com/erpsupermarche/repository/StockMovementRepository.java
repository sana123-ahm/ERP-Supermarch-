package com.erpsupermarche.repository;

import com.erpsupermarche.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, String> {
    List<StockMovement> findByProduct_IdOrderByCreatedAtDesc(String productId);
    List<StockMovement> findAllByOrderByCreatedAtDesc();
}
