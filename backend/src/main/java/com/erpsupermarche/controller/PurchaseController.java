package com.erpsupermarche.controller;

import com.erpsupermarche.dto.PurchaseDTO;
import com.erpsupermarche.entity.PurchaseStatus;
import com.erpsupermarche.service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MAGASINIER')")
    public ResponseEntity<List<PurchaseDTO>> getAllPurchases() {
        return ResponseEntity.ok(purchaseService.getAllPurchases());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MAGASINIER')")
    public ResponseEntity<PurchaseDTO> getPurchaseById(@PathVariable String id) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseDTO> createPurchase(@RequestBody PurchaseDTO purchaseDTO, java.security.Principal principal) {
        return ResponseEntity.ok(purchaseService.createPurchase(purchaseDTO, principal.getName()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseDTO> updatePurchaseStatus(@PathVariable String id, @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(purchaseService.updatePurchaseStatus(id, request.getStatus()));
    }
}

class StatusUpdateRequest {
    private PurchaseStatus status;
    public PurchaseStatus getStatus() { return status; }
    public void setStatus(PurchaseStatus status) { this.status = status; }
}
