package com.erpsupermarche.dto;

import com.erpsupermarche.entity.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDTO {
    private String id;
    private String title;
    private ReportType reportType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String totalSales;
    private String totalPurchases;
    private String totalRevenue;
    private String totalProfit;
    private Integer lowStockItems;
    private String generatedById;
    private String generatedAt;
}
