package com.erpsupermarche.service;

import com.erpsupermarche.dto.TimesheetDTO;
import com.erpsupermarche.entity.Timesheet;
import com.erpsupermarche.entity.Employee;
import com.erpsupermarche.entity.TimesheetStatus;
import com.erpsupermarche.repository.TimesheetRepository;
import com.erpsupermarche.repository.EmployeeRepository;
import com.erpsupermarche.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimesheetService {

    @Autowired
    private TimesheetRepository timesheetRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public TimesheetDTO checkIn(String userEmail, LocalDate workDate) {
        Employee employee = employeeRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for user: " + userEmail));

        Timesheet timesheet = Timesheet.builder()
                .employee(employee)
                .workDate(workDate)
                .checkInTime(LocalTime.now())
                .status(TimesheetStatus.OPEN)
                .build();

        timesheetRepository.save(timesheet);
        return convertToDTO(timesheet);
    }

    public TimesheetDTO checkInForEmployee(String employeeId, LocalDate workDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Timesheet timesheet = Timesheet.builder()
                .employee(employee)
                .workDate(workDate)
                .checkInTime(LocalTime.now())
                .status(TimesheetStatus.OPEN)
                .build();

        timesheetRepository.save(timesheet);
        return convertToDTO(timesheet);
    }

    public TimesheetDTO checkOut(String timesheetId) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Timesheet not found"));

        LocalTime checkOutTime = LocalTime.now();
        timesheet.setCheckOutTime(checkOutTime);

        if (timesheet.getCheckInTime() != null) {
            long minutes = ChronoUnit.MINUTES.between(timesheet.getCheckInTime(), checkOutTime);
            double hours = minutes / 60.0;
            timesheet.setHoursWorked(hours);
        } else {
            timesheet.setHoursWorked(0.0);
        }

        timesheet.setStatus(TimesheetStatus.SUBMITTED);
        timesheetRepository.save(timesheet);
        return convertToDTO(timesheet);
    }

    public List<TimesheetDTO> getEmployeeTimesheets(String employeeId, LocalDate startDate, LocalDate endDate) {
        return timesheetRepository.findByEmployeeIdAndWorkDateBetween(employeeId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TimesheetDTO> getTimesheetsByDateRange(LocalDate startDate, LocalDate endDate) {
        return timesheetRepository.findByWorkDateBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteTimesheet(String timesheetId) {
        Timesheet timesheet = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Timesheet not found"));
        timesheetRepository.delete(timesheet);
    }

    private TimesheetDTO convertToDTO(Timesheet timesheet) {
        return TimesheetDTO.builder()
                .id(timesheet.getId())
                .employeeId(timesheet.getEmployee().getId())
                .employeeName(timesheet.getEmployee().getFirstName() + " " + timesheet.getEmployee().getLastName())
                .workDate(timesheet.getWorkDate())
                .checkInTime(timesheet.getCheckInTime())
                .checkOutTime(timesheet.getCheckOutTime())
                .hoursWorked(timesheet.getHoursWorked())
                .status(timesheet.getStatus())
                .notes(timesheet.getNotes())
                .build();
    }
}
