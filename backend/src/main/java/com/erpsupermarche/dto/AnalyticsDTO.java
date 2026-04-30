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
public class AnalyticsDTO {
    private List<Map<String, Object>> salesByMonth;
    private List<Map<String, Object>> salesByCategory;
    private List<Map<String, Object>> topProducts;
    private List<Map<String, Object>> employeePerformance;
    private java.math.BigDecimal dailySales;
    private java.math.BigDecimal averageBasket;
}
