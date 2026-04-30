package com.erpsupermarche.controller;

import com.erpsupermarche.dto.LeaveDTO;
import com.erpsupermarche.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<List<LeaveDTO>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<List<LeaveDTO>> getEmployeeLeaves(@PathVariable String employeeId) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaves(employeeId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<List<LeaveDTO>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CAISSIER') or hasRole('MAGASINIER') or hasRole('RH') or hasRole('MANAGER')")
    public ResponseEntity<LeaveDTO> createLeaveRequest(@RequestBody LeaveDTO leaveDTO, java.security.Principal principal) {
        return ResponseEntity.ok(leaveService.createLeaveRequest(leaveDTO, principal.getName()));
    }

    @PostMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<LeaveDTO> createLeaveForEmployee(@PathVariable String employeeId, @RequestBody LeaveDTO leaveDTO) {
        return ResponseEntity.ok(leaveService.createLeaveRequestForEmployee(employeeId, leaveDTO));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<LeaveDTO> approveLeave(@PathVariable String id, java.security.Principal principal) {
        return ResponseEntity.ok(leaveService.approveLeave(id, principal.getName()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<LeaveDTO> rejectLeave(@PathVariable String id, @RequestBody RejectionRequest request, java.security.Principal principal) {
        return ResponseEntity.ok(leaveService.rejectLeave(id, request.getReason(), principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<Void> deleteLeave(@PathVariable String id) {
        leaveService.deleteLeave(id);
        return ResponseEntity.noContent().build();
    }

    static class RejectionRequest {
        private String reason;
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
    
}
