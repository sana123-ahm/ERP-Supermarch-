package com.erpsupermarche.repository;

import com.erpsupermarche.entity.Stock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, String> {
    @Query("select s from Stock s where s.product.id = :productId")
    Optional<Stock> findByProductId(@Param("productId") String productId);
}
