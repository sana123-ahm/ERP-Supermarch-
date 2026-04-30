package com.erpsupermarche.dto;

import com.erpsupermarche.entity.PurchaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseDTO {
    private String id;
    private String supplierId;
    private String supplierName;
    private String createdById;
    private LocalDateTime purchaseDate;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private PurchaseStatus status;
    private String totalAmount;
    private String taxAmount;
    private String notes;
    private List<PurchaseItemDTO> items;
}
