package com.erpsupermarche.dto;

import com.erpsupermarche.entity.LeaveStatus;
import com.erpsupermarche.entity.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveDTO {
    private String id;
    private String employeeId;
    private String employeeName;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfDays;
    private LeaveStatus status;
    private String reason;
    private String approvedById;
    private String rejectionReason;
}
