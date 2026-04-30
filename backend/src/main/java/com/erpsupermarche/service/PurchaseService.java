package com.erpsupermarche.service;

import com.erpsupermarche.dto.PurchaseDTO;
import com.erpsupermarche.dto.PurchaseItemDTO;
import com.erpsupermarche.entity.Purchase;
import com.erpsupermarche.entity.Supplier;
import com.erpsupermarche.entity.User;
import com.erpsupermarche.entity.PurchaseStatus;
import com.erpsupermarche.repository.PurchaseRepository;
import com.erpsupermarche.repository.PurchaseItemRepository;
import com.erpsupermarche.repository.ProductRepository;
import com.erpsupermarche.repository.SupplierRepository;
import com.erpsupermarche.repository.StockRepository;
import com.erpsupermarche.repository.UserRepository;
import com.erpsupermarche.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

        @Autowired
        private PurchaseItemRepository purchaseItemRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    @jakarta.transaction.Transactional
    public PurchaseDTO createPurchase(PurchaseDTO dto, String userEmail) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Purchase purchase = Purchase.builder()
                .supplier(supplier)
                .createdBy(user)
                .purchaseDate(LocalDateTime.now())
                .status(PurchaseStatus.PENDING)
                .totalAmount(dto.getTotalAmount() != null ? new BigDecimal(dto.getTotalAmount()) : BigDecimal.ZERO)
                .taxAmount(dto.getTaxAmount() != null ? new BigDecimal(dto.getTaxAmount()) : BigDecimal.ZERO)
                .notes(dto.getNotes())
                .build();

        if (dto.getItems() != null) {
            List<com.erpsupermarche.entity.PurchaseItem> purchaseItems = dto.getItems().stream().map(itemDto -> {
                com.erpsupermarche.entity.Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

                return com.erpsupermarche.entity.PurchaseItem.builder()
                        .purchase(purchase)
                        .product(product)
                        .quantity(itemDto.getQuantity())
                        .unitPrice(itemDto.getUnitPrice() != null ? new BigDecimal(itemDto.getUnitPrice()) : BigDecimal.ZERO)
                        .totalPrice(itemDto.getTotalPrice() != null ? new BigDecimal(itemDto.getTotalPrice()) : BigDecimal.ZERO)
                        .build();
            }).collect(Collectors.toList());
            purchase.setItems(purchaseItems);
        }

        purchaseRepository.save(purchase);
        return convertToDTO(purchase);
    }

        @jakarta.transaction.Transactional
    public PurchaseDTO getPurchaseById(String id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found"));
        return convertToDTO(purchase);
    }

        @jakarta.transaction.Transactional
    public List<PurchaseDTO> getAllPurchases() {
        return purchaseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

        @jakarta.transaction.Transactional
    public PurchaseDTO updatePurchaseStatus(String id, PurchaseStatus status) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found"));

        purchase.setStatus(status);

                if (status == PurchaseStatus.RECEIVED && purchase.getItems() != null) {
                        purchase.getItems().forEach(item -> {
                                com.erpsupermarche.entity.Stock stock = stockRepository.findByProductId(item.getProduct().getId())
                                                .orElseGet(() -> {
                                                    com.erpsupermarche.entity.Stock newStock = com.erpsupermarche.entity.Stock.builder()
                                                            .product(item.getProduct())
                                                            .quantity(0)
                                                            .minQuantity(10)
                                                            .build();
                                                    return stockRepository.save(newStock);
                                                });
                                stock.setQuantity(stock.getQuantity() + item.getQuantity());
                                stockRepository.save(stock);
                        });
                        purchase.setActualDeliveryDate(LocalDateTime.now());
                }

        purchaseRepository.save(purchase);
        return convertToDTO(purchase);
    }

    private PurchaseDTO convertToDTO(Purchase purchase) {
            List<PurchaseItemDTO> items = purchaseItemRepository.findByPurchaseIdOrderByIdAsc(purchase.getId()).stream()
                                .map(item -> PurchaseItemDTO.builder()
                                                .id(item.getId())
                                                .productId(item.getProduct().getId())
                                                .productName(item.getProduct().getName())
                                                .quantity(item.getQuantity())
                                                .unitPrice(item.getUnitPrice() != null ? item.getUnitPrice().toString() : null)
                                                .totalPrice(item.getTotalPrice() != null ? item.getTotalPrice().toString() : null)
                                                .taxPercentage(item.getTaxPercentage() != null ? item.getTaxPercentage().toString() : null)
                                                .build())
                                .collect(Collectors.toList());

        return PurchaseDTO.builder()
                .id(purchase.getId())
                .supplierId(purchase.getSupplier().getId())
                .supplierName(purchase.getSupplier().getName())
                .createdById(purchase.getCreatedBy().getId())
                .purchaseDate(purchase.getPurchaseDate())
                                .expectedDeliveryDate(purchase.getExpectedDeliveryDate())
                                .actualDeliveryDate(purchase.getActualDeliveryDate())
                .status(purchase.getStatus())
                                .totalAmount(purchase.getTotalAmount() != null ? purchase.getTotalAmount().toString() : null)
                                .taxAmount(purchase.getTaxAmount() != null ? purchase.getTaxAmount().toString() : null)
                .notes(purchase.getNotes())
                                .items(items)
                .build();
    }
}
