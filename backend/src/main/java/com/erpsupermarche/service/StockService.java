package com.erpsupermarche.service;

import com.erpsupermarche.dto.StockDTO;
import com.erpsupermarche.entity.Stock;
import com.erpsupermarche.entity.Product;
import com.erpsupermarche.repository.StockRepository;
import com.erpsupermarche.repository.ProductRepository;
import com.erpsupermarche.repository.StockMovementRepository;
import com.erpsupermarche.entity.StockMovement;
import com.erpsupermarche.dto.StockMovementDTO;
import com.erpsupermarche.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    public StockDTO createStock(String productId, Integer quantity, Integer minQuantity, Integer maxQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Stock stock = Stock.builder()
                .product(product)
                .quantity(quantity)
                .minQuantity(minQuantity)
                .maxQuantity(maxQuantity)
                .lastUpdated(LocalDateTime.now())
                .build();

        stockRepository.save(stock);
        return convertToDTO(stock);
    }

    public List<StockDTO> getAllStocks() {
        return stockRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StockDTO getStockByProductId(String productId) {
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));
        return convertToDTO(stock);
    }

    public StockDTO updateStock(String productId, Integer quantity) {
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        stock.setQuantity(quantity);
        stock.setLastUpdated(LocalDateTime.now());
        stockRepository.save(stock);
        
        recordMovement(stock.getProduct(), quantity, "INVENTORY", "Mise à jour manuelle");
        
        return convertToDTO(stock);
    }

    public StockDTO incrementStock(String productId, Integer quantity) {
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        stock.setQuantity(stock.getQuantity() + quantity);
        stock.setLastUpdated(LocalDateTime.now());
        stockRepository.save(stock);

        recordMovement(stock.getProduct(), quantity, "IN", "Entrée de stock");

        return convertToDTO(stock);
    }

    public StockDTO decrementStock(String productId, Integer quantity) {
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        if (stock.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        stock.setQuantity(stock.getQuantity() - quantity);
        stock.setLastUpdated(LocalDateTime.now());
        stockRepository.save(stock);

        recordMovement(stock.getProduct(), quantity, "OUT", "Sortie de stock (Vente ou autre)");

        return convertToDTO(stock);
    }

    public List<StockMovementDTO> getAllMovements() {
        return stockMovementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(m -> StockMovementDTO.builder()
                        .id(m.getId())
                        .productId(m.getProduct().getId())
                        .productName(m.getProduct().getName())
                        .quantity(m.getQuantity())
                        .type(m.getType())
                        .reason(m.getReason())
                        .date(m.getCreatedAt())
                        .userName(m.getUser() != null ? m.getUser().getName() : "Système")
                        .build())
                .collect(Collectors.toList());
    }

    public List<StockMovementDTO> getMovementsByProductId(String productId) {
        return stockMovementRepository.findByProduct_IdOrderByCreatedAtDesc(productId).stream()
                .map(m -> StockMovementDTO.builder()
                        .id(m.getId())
                        .productId(m.getProduct().getId())
                        .productName(m.getProduct().getName())
                        .quantity(m.getQuantity())
                        .type(m.getType())
                        .reason(m.getReason())
                        .date(m.getCreatedAt())
                        .userName(m.getUser() != null ? m.getUser().getName() : "Système")
                        .build())
                .collect(Collectors.toList());
    }

    private void recordMovement(Product product, Integer quantity, String type, String reason) {
        StockMovement movement = StockMovement.builder()
                .product(product)
                .quantity(quantity)
                .type(type != null ? type.toUpperCase() : "UNKNOWN")
                .reason(reason != null ? reason : "Aucune raison fournie")
                .createdAt(LocalDateTime.now())
                .build();
        stockMovementRepository.save(movement);
    }

    public StockMovementDTO addMovement(StockMovementDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Stock stock = stockRepository.findByProductId(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        if ("IN".equalsIgnoreCase(dto.getType())) {
            stock.setQuantity(stock.getQuantity() + dto.getQuantity());
        } else if ("OUT".equalsIgnoreCase(dto.getType())) {
            if (stock.getQuantity() < dto.getQuantity()) throw new RuntimeException("Insufficient stock");
            stock.setQuantity(stock.getQuantity() - dto.getQuantity());
        } else if ("INVENTORY".equalsIgnoreCase(dto.getType())) {
            stock.setQuantity(dto.getQuantity());
        }

        stock.setLastUpdated(LocalDateTime.now());
        stockRepository.save(stock);

        StockMovement movement = StockMovement.builder()
                .product(product)
                .quantity(dto.getQuantity())
                .type(dto.getType() != null ? dto.getType().toUpperCase() : "IN")
                .reason(dto.getReason() != null ? dto.getReason() : "Ajustement de stock")
                .createdAt(LocalDateTime.now())
                .build();
        
        stockMovementRepository.save(movement);
        
        return StockMovementDTO.builder()
                .id(movement.getId())
                .productId(product.getId())
                .productName(product.getName())
                .quantity(movement.getQuantity())
                .type(movement.getType())
                .reason(movement.getReason())
                .date(movement.getCreatedAt())
                .build();
    }

    private StockDTO convertToDTO(Stock stock) {
        return StockDTO.builder()
                .id(stock.getId())
                .productId(stock.getProduct().getId())
                .productName(stock.getProduct().getName())
                .quantity(stock.getQuantity())
                .minQuantity(stock.getMinQuantity())
                .maxQuantity(stock.getMaxQuantity())
                .warehouseLocation(stock.getWarehouseLocation())
                .lastUpdated(stock.getLastUpdated().toString())
                .build();
    }
}
