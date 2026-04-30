package com.erpsupermarche.repository;

import com.erpsupermarche.entity.Report;
import com.erpsupermarche.entity.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByReportType(ReportType reportType);
    List<Report> findByGeneratedByIdOrderByGeneratedAtDesc(String userId);
    List<Report> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
}
