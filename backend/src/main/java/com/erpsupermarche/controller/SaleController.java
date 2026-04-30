package com.erpsupermarche.controller;

import com.erpsupermarche.dto.SaleDTO;
import com.erpsupermarche.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SaleController {

    @Autowired
    private SaleService saleService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CAISSIER')")
    public ResponseEntity<List<SaleDTO>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CAISSIER')")
    public ResponseEntity<SaleDTO> getSaleById(@PathVariable String id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    @GetMapping("/cashier/{cashierId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CAISSIER')")
    public ResponseEntity<List<SaleDTO>> getSalesByCashier(@PathVariable String cashierId) {
        return ResponseEntity.ok(saleService.getSalesByCashier(cashierId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CAISSIER')")
    public ResponseEntity<SaleDTO> createSale(@RequestBody SaleDTO saleDTO, java.security.Principal principal) {
        return ResponseEntity.ok(saleService.createSale(saleDTO, principal.getName()));
    }
}
