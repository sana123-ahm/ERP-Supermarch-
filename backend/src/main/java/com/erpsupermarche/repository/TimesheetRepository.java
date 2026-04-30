package com.erpsupermarche.repository;

import com.erpsupermarche.entity.Timesheet;
import com.erpsupermarche.entity.TimesheetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, String> {
    List<Timesheet> findByEmployeeId(String employeeId);
    List<Timesheet> findByStatus(TimesheetStatus status);
    List<Timesheet> findByWorkDateBetween(LocalDate startDate, LocalDate endDate);
    List<Timesheet> findByEmployeeIdAndWorkDateBetween(String employeeId, LocalDate startDate, LocalDate endDate);
}
