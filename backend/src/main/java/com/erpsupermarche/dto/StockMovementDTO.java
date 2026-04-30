package com.erpsupermarche.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementDTO {
    private String id;
    private String productId;
    private String productName;
    private Integer quantity;
    private String type;
    private String reason;
    private LocalDateTime date;
    private String userName;
}
