package com.erpsupermarche.service;

import com.erpsupermarche.dto.LeaveDTO;
import com.erpsupermarche.entity.Leave;
import com.erpsupermarche.entity.Employee;
import com.erpsupermarche.entity.LeaveStatus;
import com.erpsupermarche.repository.LeaveRepository;
import com.erpsupermarche.repository.EmployeeRepository;
import com.erpsupermarche.repository.UserRepository;
import com.erpsupermarche.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    public LeaveDTO createLeaveRequest(LeaveDTO dto, String userEmail) {
        Employee employee = employeeRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for user: " + userEmail));

        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        Leave leave = Leave.builder()
                .employee(employee)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .numberOfDays((int) days)
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        leaveRepository.save(leave);
        return convertToDTO(leave);
    }

    public LeaveDTO createLeaveRequestForEmployee(String employeeId, LeaveDTO dto) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        Leave leave = Leave.builder()
                .employee(employee)
                .leaveType(dto.getLeaveType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .numberOfDays((int) days)
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        leaveRepository.save(leave);
        return convertToDTO(leave);
    }

    public LeaveDTO approveLeave(String leaveId, String approverEmail) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found"));

        var approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + approverEmail));

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovalDate(LocalDateTime.now());
        leave.setApprovedBy(approver);
        leaveRepository.save(leave);
        return convertToDTO(leave);
    }

    public LeaveDTO rejectLeave(String leaveId, String reason, String approverEmail) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found"));

        var approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + approverEmail));

        leave.setStatus(LeaveStatus.REJECTED);
        leave.setRejectionReason(reason);
        leave.setApprovedBy(approver);
        leaveRepository.save(leave);
        return convertToDTO(leave);
    }

    public List<LeaveDTO> getEmployeeLeaves(String employeeId) {
        return leaveRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveDTO> getPendingLeaves() {
        return leaveRepository.findByStatus(LeaveStatus.PENDING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveDTO> getAllLeaves() {
        return leaveRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteLeave(String leaveId) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found"));
        leaveRepository.delete(leave);
    }

    private LeaveDTO convertToDTO(Leave leave) {
        return LeaveDTO.builder()
                .id(leave.getId())
                .employeeId(leave.getEmployee().getId())
                .employeeName(leave.getEmployee().getFirstName() + " " + leave.getEmployee().getLastName())
                .leaveType(leave.getLeaveType())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .numberOfDays(leave.getNumberOfDays())
                .status(leave.getStatus())
                .reason(leave.getReason())
            .approvedById(leave.getApprovedBy() != null ? leave.getApprovedBy().getId() : null)
            .rejectionReason(leave.getRejectionReason())
                .build();
    }
}
