package com.erpsupermarche.dto;

import com.erpsupermarche.entity.TimesheetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimesheetDTO {
    private String id;
    private String employeeId;
    private String employeeName;
    private LocalDate workDate;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Double hoursWorked;
    private TimesheetStatus status;
    private String notes;
    private String approvedById;
}
