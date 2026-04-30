package com.erpsupermarche.repository;

import com.erpsupermarche.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, String> {
    Optional<Supplier> findByEmail(String email);
    Optional<Supplier> findByTaxId(String taxId);
    List<Supplier> findByActiveTrue();
    List<Supplier> findByNameContainingIgnoreCase(String name);
    List<Supplier> findByCity(String city);
}
