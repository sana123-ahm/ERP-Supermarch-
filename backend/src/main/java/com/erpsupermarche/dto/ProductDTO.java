package com.erpsupermarche.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private String id;
    private String name;
    private String description;
    private Double price;
    private Double costPrice;
    private Double tva;
    private Integer stock;
    private Integer threshold;
    private String barcode;
    private String sku;
    private String category;
    private String imageUrl;
    private Boolean active;
}
