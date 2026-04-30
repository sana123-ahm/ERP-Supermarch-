package com.erpsupermarche.controller;

import com.erpsupermarche.dto.ReportDTO;
import com.erpsupermarche.dto.AnalyticsDTO;
import com.erpsupermarche.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AnalyticsDTO> getAnalytics() {
        return ResponseEntity.ok(reportService.getAnalytics());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ReportDTO> getReportById(@PathVariable String id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ReportDTO>> getUserReports(@PathVariable String userId) {
        return ResponseEntity.ok(reportService.getUserReports(userId));
    }

    @PostMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ReportDTO> generateSalesReport(@RequestBody ReportDTO reportDTO, java.security.Principal principal) {
        return ResponseEntity.ok(reportService.generateSalesReport(reportDTO, principal.getName()));
    }

    @GetMapping("/export/{reportType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<byte[]> exportReport(@PathVariable String reportType) {
        String csv = reportService.generateCsvExport(reportType);
        String filename = "rapport_" + reportType + "_" + java.time.LocalDate.now() + ".csv";
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv; charset=UTF-8")
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
