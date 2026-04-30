package com.erpsupermarche.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseItemDTO {
    private String id;
    private String productId;
    private String productName;
    private Integer quantity;
    private String unitPrice;
    private String totalPrice;
    private String taxPercentage;
}