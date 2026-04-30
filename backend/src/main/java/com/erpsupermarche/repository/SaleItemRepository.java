package com.erpsupermarche.repository;

import com.erpsupermarche.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, String> {
	List<SaleItem> findBySaleIdOrderByIdAsc(String saleId);
}
