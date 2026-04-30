package com.erpsupermarche.service;

import com.erpsupermarche.dto.ReportDTO;
import com.erpsupermarche.entity.Report;
import com.erpsupermarche.entity.ReportType;
import com.erpsupermarche.entity.User;
import com.erpsupermarche.repository.ReportRepository;
import com.erpsupermarche.repository.UserRepository;
import com.erpsupermarche.repository.SaleRepository;
import com.erpsupermarche.repository.PurchaseRepository;
import com.erpsupermarche.repository.SaleItemRepository;
import com.erpsupermarche.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @jakarta.transaction.Transactional
    public ReportDTO generateSalesReport(ReportDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        var sales = saleRepository.findBySaleDateBetween(
                dto.getStartDate().atStartOfDay(),
                dto.getEndDate().atTime(23, 59, 59)
        );

        BigDecimal totalSales = sales.stream()
                .map(s -> s.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Report report = Report.builder()
                .title(dto.getTitle())
                .reportType(ReportType.SALES)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .totalSales(totalSales)
                .generatedBy(user)
                .build();

        reportRepository.save(report);
        return convertToDTO(report);
    }

    @jakarta.transaction.Transactional
    public ReportDTO getReportById(String id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        return convertToDTO(report);
    }

    @jakarta.transaction.Transactional
    public List<ReportDTO> getUserReports(String userId) {
        return reportRepository.findByGeneratedByIdOrderByGeneratedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Autowired
    private SaleItemRepository saleItemRepository;

    @jakarta.transaction.Transactional
    public com.erpsupermarche.dto.AnalyticsDTO getAnalytics() {
        // Sales By Month (last 6 months)
        List<java.util.Map<String, Object>> salesByMonth = new java.util.ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            java.time.YearMonth ym = java.time.YearMonth.now().minusMonths(i);
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);
            
            var monthSales = saleRepository.findBySaleDateBetween(start, end);
            java.math.BigDecimal revenue = monthSales.stream()
                    .map(s -> s.getTotalAmount())
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("month", ym.getMonth().name().substring(0, 3));
            data.put("ventes", revenue);
            data.put("achats", 0); // Simplified
            salesByMonth.add(data);
        }

        // Sales By Category
        var allSales = saleRepository.findAll();
        java.util.Map<String, java.math.BigDecimal> catMap = new java.util.HashMap<>();
        for (var sale : allSales) {
            for (var item : sale.getItems()) {
                String cat = item.getProduct().getCategory() != null ? item.getProduct().getCategory() : "Autres";
                catMap.put(cat, catMap.getOrDefault(cat, java.math.BigDecimal.ZERO).add(item.getTotalPrice()));
            }
        }
        List<java.util.Map<String, Object>> salesByCategory = catMap.entrySet().stream()
                .map(e -> {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("name", e.getKey());
                    m.put("value", e.getValue());
                    return m;
                }).collect(Collectors.toList());

        // Top Products
        java.util.Map<String, Integer> prodCount = new java.util.HashMap<>();
        java.util.Map<String, java.math.BigDecimal> prodRev = new java.util.HashMap<>();
        for (var sale : allSales) {
            for (var item : sale.getItems()) {
                String name = item.getProduct().getName();
                prodCount.put(name, prodCount.getOrDefault(name, 0) + item.getQuantity());
                prodRev.put(name, prodRev.getOrDefault(name, java.math.BigDecimal.ZERO).add(item.getTotalPrice()));
            }
        }
        List<java.util.Map<String, Object>> topProducts = prodCount.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("name", e.getKey());
                    m.put("sold", e.getValue());
                    m.put("revenue", prodRev.get(e.getKey()));
                    return m;
                }).collect(Collectors.toList());

        // Employee Performance
        java.util.Map<String, java.math.BigDecimal> empPerf = new java.util.HashMap<>();
        for (var sale : allSales) {
            String name = sale.getCashier().getName();
            empPerf.put(name, empPerf.getOrDefault(name, java.math.BigDecimal.ZERO).add(sale.getTotalAmount()));
        }
        List<java.util.Map<String, Object>> employeePerformance = empPerf.entrySet().stream()
                .map(e -> {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("name", e.getKey());
                    m.put("ca", e.getValue());
                    return m;
                }).collect(Collectors.toList());

        // Daily Sales (Today)
        LocalDateTime startOfToday = java.time.LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = java.time.LocalDate.now().atTime(23, 59, 59);
        var todaySalesList = saleRepository.findBySaleDateBetween(startOfToday, endOfToday);
        java.math.BigDecimal dailySales = todaySalesList.stream()
                .map(s -> s.getTotalAmount())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        // Average Basket (All Time)
        java.math.BigDecimal averageBasket = java.math.BigDecimal.ZERO;
        if (!allSales.isEmpty()) {
            java.math.BigDecimal totalRevenue = allSales.stream()
                    .map(s -> s.getTotalAmount())
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            averageBasket = totalRevenue.divide(new java.math.BigDecimal(allSales.size()), 2, java.math.RoundingMode.HALF_UP);
        }

        return com.erpsupermarche.dto.AnalyticsDTO.builder()
                .salesByMonth(salesByMonth)
                .salesByCategory(salesByCategory)
                .topProducts(topProducts)
                .employeePerformance(employeePerformance)
                .dailySales(dailySales)
                .averageBasket(averageBasket)
                .build();
    }

    @Autowired
    private com.erpsupermarche.repository.ProductRepository productRepository;

    @Autowired
    private com.erpsupermarche.repository.StockRepository stockRepository;

    @Autowired
    private com.erpsupermarche.repository.EmployeeRepository employeeRepository;

    @Autowired
    private com.erpsupermarche.repository.TimesheetRepository timesheetRepository;

    public String generateCsvExport(String reportType) {
        StringBuilder csv = new StringBuilder();
        // Add BOM for Excel UTF-8 compatibility
        csv.append("\uFEFF");

        switch (reportType.toLowerCase()) {
            case "sales":
                csv.append("Date,Numéro Ticket,Caissier,Montant Total,TVA,Paiement,Articles\n");
                var sales = saleRepository.findAll();
                for (var sale : sales) {
                    int itemCount = sale.getItems() != null ? sale.getItems().size() : 0;
                    csv.append(String.format("%s,%s,%s,%s,%s,%s,%d\n",
                            sale.getSaleDate() != null ? sale.getSaleDate().toLocalDate().toString() : "",
                            sale.getReceiptNumber() != null ? sale.getReceiptNumber() : sale.getId().substring(0, 8),
                            sale.getCashier() != null ? escapeCsv(sale.getCashier().getName()) : "",
                            sale.getTotalAmount() != null ? sale.getTotalAmount().toString() : "0",
                            sale.getTaxAmount() != null ? sale.getTaxAmount().toString() : "0",
                            sale.getPaymentMethod() != null ? sale.getPaymentMethod().name() : "",
                            itemCount));
                }
                break;

            case "stocks":
                csv.append("Produit,SKU,Code-barres,Catégorie,Prix Vente,Quantité en Stock,Seuil Alerte,Statut\n");
                var stocks = stockRepository.findAll();
                for (var stock : stocks) {
                    var product = stock.getProduct();
                    String statut = stock.getQuantity() <= stock.getMinQuantity() ? "ALERTE" : "OK";
                    csv.append(String.format("%s,%s,%s,%s,%s,%d,%d,%s\n",
                            escapeCsv(product.getName()),
                            product.getSku() != null ? product.getSku() : "",
                            product.getBarcode() != null ? product.getBarcode() : "",
                            product.getCategory() != null ? product.getCategory() : "",
                            product.getPrice() != null ? product.getPrice().toString() : "0",
                            stock.getQuantity(),
                            stock.getMinQuantity(),
                            statut));
                }
                break;

            case "financial":
                csv.append("Mois,Chiffre d'Affaires,Nombre de Ventes\n");
                for (int i = 5; i >= 0; i--) {
                    java.time.YearMonth ym = java.time.YearMonth.now().minusMonths(i);
                    LocalDateTime start = ym.atDay(1).atStartOfDay();
                    LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);
                    var monthSales = saleRepository.findBySaleDateBetween(start, end);
                    java.math.BigDecimal revenue = monthSales.stream()
                            .map(s -> s.getTotalAmount())
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                    csv.append(String.format("%s,%s,%d\n",
                            ym.getMonth().name() + " " + ym.getYear(),
                            revenue.toString(),
                            monthSales.size()));
                }
                break;

            case "hr":
                csv.append("Employé,Poste,Département,Contrat,Date Embauche,Salaire,Statut\n");
                var employees = employeeRepository.findByActiveTrue();
                for (var emp : employees) {
                    csv.append(String.format("%s %s,%s,%s,%s,%s,%s,%s\n",
                            emp.getFirstName(),
                            emp.getLastName(),
                            emp.getPosition() != null ? emp.getPosition() : "",
                            emp.getDepartment() != null ? emp.getDepartment() : "",
                            emp.getContractType() != null ? emp.getContractType() : "",
                            emp.getHireDate() != null ? emp.getHireDate().toString() : "",
                            emp.getSalary() != null ? emp.getSalary().toString() : "0",
                            emp.getStatus() != null ? emp.getStatus().name() : ""));
                }
                break;

            default:
                csv.append("Erreur: Type de rapport inconnu: " + reportType + "\n");
        }

        return csv.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private ReportDTO convertToDTO(Report report) {
        return ReportDTO.builder()
                .id(report.getId())
                .title(report.getTitle())
                .reportType(report.getReportType())
                .startDate(report.getStartDate())
                .endDate(report.getEndDate())
                .totalSales(report.getTotalSales() != null ? report.getTotalSales().toString() : "0")
                .totalRevenue(report.getTotalRevenue() != null ? report.getTotalRevenue().toString() : "0")
                .generatedById(report.getGeneratedBy().getId())
                .generatedAt(report.getGeneratedAt().toString())
                .build();
    }
}
