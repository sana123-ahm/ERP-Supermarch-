package com.erpsupermarche.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private String todayRevenue;
    private Long todaySalesCount;
    private Long totalProductsCount;
    private Long lowStockCount;
    private List<Map<String, Object>> weeklySales;
    private List<Map<String, Object>> topProducts;
    private List<Map<String, Object>> categoryDistribution;
    private List<Map<String, Object>> lowStockAlerts;
}
