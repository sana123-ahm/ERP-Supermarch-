package com.erpsupermarche.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockDTO {
    private String id;
    private String productId;
    private String productName;
    private Integer quantity;
    private Integer minQuantity;
    private Integer maxQuantity;
    private String warehouseLocation;
    private String lastUpdated;
}
