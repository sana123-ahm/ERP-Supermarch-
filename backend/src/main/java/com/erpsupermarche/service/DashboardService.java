package com.erpsupermarche.service;

import com.erpsupermarche.dto.DashboardDTO;
import com.erpsupermarche.repository.SaleRepository;
import com.erpsupermarche.repository.ProductRepository;
import com.erpsupermarche.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    public DashboardDTO getDashboardStats() {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);

        var todaySales = saleRepository.findBySaleDateBetween(startOfDay, endOfDay);
        BigDecimal todayRevenue = todaySales.stream()
                .map(s -> s.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Low stock alerts
        List<Map<String, Object>> lowStockAlerts = new ArrayList<>();
        stockRepository.findAll().stream()
                .filter(s -> s.getQuantity() <= s.getMinQuantity())
                .limit(5)
                .forEach(s -> {
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("name", s.getProduct().getName());
                    alert.put("stock", s.getQuantity());
                    alert.put("seuil", s.getMinQuantity());
                    alert.put("criticite", s.getQuantity() == 0 ? "haute" : "moyenne");
                    lowStockAlerts.add(alert);
                });

        // Category distribution
        Map<String, Integer> categoryCounts = new HashMap<>();
        productRepository.findAll().forEach(p -> {
            categoryCounts.merge(p.getCategory(), 1, Integer::sum);
        });
        
        List<Map<String, Object>> categoryDistribution = new ArrayList<>();
        long totalProducts = productRepository.count();
        if (totalProducts > 0) {
            String[] colors = {"#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"};
            int colorIdx = 0;
            for (Map.Entry<String, Integer> entry : categoryCounts.entrySet()) {
                Map<String, Object> catData = new HashMap<>();
                catData.put("name", entry.getKey());
                catData.put("value", Math.round((entry.getValue() * 100.0) / totalProducts));
                catData.put("color", colors[colorIdx % colors.length]);
                categoryDistribution.add(catData);
                colorIdx++;
            }
        }

        long lowStockCount = stockRepository.findAll().stream()
                .filter(s -> s.getQuantity() <= s.getMinQuantity())
                .count();

        // Weekly sales (last 7 days)
        List<Map<String, Object>> weeklySales = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime start = LocalDateTime.now().minusDays(i).with(LocalTime.MIN);
            LocalDateTime end = LocalDateTime.now().minusDays(i).with(LocalTime.MAX);
            var daySales = saleRepository.findBySaleDateBetween(start, end);
            BigDecimal dayRevenue = daySales.stream()
                    .map(s -> s.getTotalAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("day", start.getDayOfWeek().name().substring(0, 3));
            dayData.put("ventes", dayRevenue);
            dayData.put("achats", 0); // Placeholder
            weeklySales.add(dayData);
        }

        return DashboardDTO.builder()
                .todayRevenue(todayRevenue.toString() + " DH")
                .todaySalesCount((long) todaySales.size())
                .totalProductsCount(totalProducts)
                .lowStockCount(lowStockCount)
                .weeklySales(weeklySales)
                .topProducts(new ArrayList<>())
                .categoryDistribution(categoryDistribution)
                .lowStockAlerts(lowStockAlerts)
                .build();
    }
}
