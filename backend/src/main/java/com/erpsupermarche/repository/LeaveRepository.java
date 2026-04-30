package com.erpsupermarche.repository;

import com.erpsupermarche.entity.Leave;
import com.erpsupermarche.entity.LeaveStatus;
import com.erpsupermarche.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, String> {
    List<Leave> findByEmployeeId(String employeeId);
    List<Leave> findByStatus(LeaveStatus status);
    List<Leave> findByLeaveType(LeaveType leaveType);
    List<Leave> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
    List<Leave> findByEmployeeIdAndStatus(String employeeId, LeaveStatus status);
}
