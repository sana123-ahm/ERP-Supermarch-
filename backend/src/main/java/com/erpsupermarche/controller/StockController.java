package com.erpsupermarche.controller;

import com.erpsupermarche.dto.StockDTO;
import com.erpsupermarche.dto.StockMovementDTO;
import com.erpsupermarche.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class StockController {

    @Autowired
    private StockService stockService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MAGASINIER')")
    public ResponseEntity<List<StockDTO>> getAllStocks() {
        return ResponseEntity.ok(stockService.getAllStocks());
    }

    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MAGASINIER')")
    public ResponseEntity<List<StockMovementDTO>> getAllMovements() {
        return ResponseEntity.ok(stockService.getAllMovements());
    }

    @GetMapping("/{productId}/movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MAGASINIER')")
    public ResponseEntity<List<StockMovementDTO>> getMovementsByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(stockService.getMovementsByProductId(productId));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<StockDTO> getStockByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(stockService.getStockByProductId(productId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MAGASINIER')")
    public ResponseEntity<StockDTO> createStock(@RequestBody StockCreateRequest request) {
        return ResponseEntity.ok(stockService.createStock(
                request.getProductId(),
                request.getQuantity(),
                request.getMinQuantity(),
                request.getMaxQuantity()
        ));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MAGASINIER')")
    public ResponseEntity<StockDTO> updateStock(@PathVariable String productId, @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(stockService.updateStock(productId, request.getQuantity()));
    }

    @PutMapping("/{productId}/increment")
    @PreAuthorize("hasAnyRole('ADMIN', 'MAGASINIER')")
    public ResponseEntity<StockDTO> incrementStock(@PathVariable String productId, @RequestBody StockChangeRequest request) {
        return ResponseEntity.ok(stockService.incrementStock(productId, request.getQuantity()));
    }

    @PutMapping("/{productId}/decrement")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAISSIER', 'MAGASINIER')")
    public ResponseEntity<StockDTO> decrementStock(@PathVariable String productId, @RequestBody StockChangeRequest request) {
        return ResponseEntity.ok(stockService.decrementStock(productId, request.getQuantity()));
    }

    @PostMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MAGASINIER')")
    public ResponseEntity<StockMovementDTO> addMovement(@RequestBody StockMovementDTO movementDTO) {
        return ResponseEntity.ok(stockService.addMovement(movementDTO));
    }
}

class StockCreateRequest {
    private String productId;
    private Integer quantity;
    private Integer minQuantity;
    private Integer maxQuantity;

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getMinQuantity() { return minQuantity; }
    public void setMinQuantity(Integer minQuantity) { this.minQuantity = minQuantity; }

    public Integer getMaxQuantity() { return maxQuantity; }
    public void setMaxQuantity(Integer maxQuantity) { this.maxQuantity = maxQuantity; }
}

class StockUpdateRequest {
    private Integer quantity;
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}

class StockChangeRequest {
    private Integer quantity;
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
}
