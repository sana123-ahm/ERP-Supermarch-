package com.erpsupermarche.service;

import com.erpsupermarche.dto.SaleDTO;
import com.erpsupermarche.dto.SaleItemDTO;
import com.erpsupermarche.entity.Sale;
import com.erpsupermarche.entity.User;
import com.erpsupermarche.entity.SaleStatus;
import com.erpsupermarche.repository.SaleRepository;
import com.erpsupermarche.repository.SaleItemRepository;
import com.erpsupermarche.repository.ProductRepository;
import com.erpsupermarche.repository.StockRepository;
import com.erpsupermarche.repository.UserRepository;
import com.erpsupermarche.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

        @Autowired
        private SaleItemRepository saleItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    @jakarta.transaction.Transactional
    public SaleDTO createSale(SaleDTO dto, String cashierEmail) {
        User cashier = userRepository.findByEmail(cashierEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String receiptNumber = "RCP-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Sale sale = Sale.builder()
                .cashier(cashier)
                .saleDate(LocalDateTime.now())
                .totalAmount(new BigDecimal(dto.getTotalAmount()))
                .taxAmount(new BigDecimal(dto.getTaxAmount()))
                .discountAmount(new BigDecimal(dto.getDiscountAmount() != null ? dto.getDiscountAmount() : "0"))
                .paymentMethod(dto.getPaymentMethod())
                .status(SaleStatus.COMPLETED)
                .receiptNumber(receiptNumber)
                .build();

        List<com.erpsupermarche.entity.SaleItem> saleItems = dto.getItems().stream().map(itemDto -> {
            com.erpsupermarche.entity.Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

            BigDecimal unitPrice = new BigDecimal(itemDto.getUnitPrice());
            BigDecimal totalPrice = itemDto.getTotalPrice() != null
                    ? new BigDecimal(itemDto.getTotalPrice())
                    : unitPrice.multiply(BigDecimal.valueOf(itemDto.getQuantity()));

            // Update stock
            com.erpsupermarche.entity.Stock stock = stockRepository.findByProductId(product.getId())
                    .orElseGet(() -> com.erpsupermarche.entity.Stock.builder()
                            .product(product)
                            .quantity(0)
                            .minQuantity(10)
                            .build());
            
            if (stock.getQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Stock insuffisant pour le produit: " + product.getName() + " (Stock actuel: " + stock.getQuantity() + ")");
            }
            
            stock.setQuantity(stock.getQuantity() - itemDto.getQuantity());
            stockRepository.save(stock);

            return com.erpsupermarche.entity.SaleItem.builder()
                    .sale(sale)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .discountPercentage(new BigDecimal(itemDto.getDiscountPercentage() != null ? itemDto.getDiscountPercentage() : "0"))
                    .build();
        }).collect(Collectors.toList());

        sale.setItems(saleItems);
        saleRepository.save(sale);
        return convertToDTO(sale);
    }

    public SaleDTO getSaleById(String id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
        return convertToDTO(sale);
    }

    public List<SaleDTO> getSalesByCashier(String cashierId) {
        return saleRepository.findByCashierId(cashierId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SaleDTO> getAllSales() {
        return saleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

        private List<SaleItemDTO> mapItems(String saleId) {
                return saleItemRepository.findBySaleIdOrderByIdAsc(saleId).stream()
                                .map(item -> SaleItemDTO.builder()
                                                .id(item.getId())
                                                .productId(item.getProduct().getId())
                                                .productName(item.getProduct().getName())
                                                .quantity(item.getQuantity())
                                                .unitPrice(item.getUnitPrice() != null ? item.getUnitPrice().toString() : null)
                                                .totalPrice(item.getTotalPrice() != null ? item.getTotalPrice().toString() : null)
                                                .discountPercentage(item.getDiscountPercentage() != null ? item.getDiscountPercentage().toString() : null)
                                                .build())
                                .collect(Collectors.toList());
        }

    private SaleDTO convertToDTO(Sale sale) {
        return SaleDTO.builder()
                .id(sale.getId())
                .cashierId(sale.getCashier().getId())
                .cashierName(sale.getCashier().getName())
                .saleDate(sale.getSaleDate())
                .totalAmount(sale.getTotalAmount().toString())
                .taxAmount(sale.getTaxAmount().toString())
                .discountAmount(sale.getDiscountAmount().toString())
                .paymentMethod(sale.getPaymentMethod())
                .status(sale.getStatus())
                .receiptNumber(sale.getReceiptNumber())
                                .items(mapItems(sale.getId()))
                .build();
    }
}
