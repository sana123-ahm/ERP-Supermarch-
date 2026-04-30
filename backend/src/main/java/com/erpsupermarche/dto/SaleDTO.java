package com.erpsupermarche.dto;

import com.erpsupermarche.entity.PaymentMethod;
import com.erpsupermarche.entity.SaleStatus;
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
public class SaleDTO {
    private String id;
    private String cashierId;
    private String cashierName;
    private LocalDateTime saleDate;
    private String totalAmount;
    private String taxAmount;
    private String discountAmount;
    private PaymentMethod paymentMethod;
    private SaleStatus status;
    private String receiptNumber;
    private List<SaleItemDTO> items;
}
