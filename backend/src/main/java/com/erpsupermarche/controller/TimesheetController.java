package com.erpsupermarche.controller;

import com.erpsupermarche.dto.TimesheetDTO;
import com.erpsupermarche.service.TimesheetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/timesheets")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TimesheetController {

    @Autowired
    private TimesheetService timesheetService;

    @PostMapping("/{employeeId}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'MAGASINIER', 'CAISSIER', 'RH', 'MANAGER')")
    public ResponseEntity<TimesheetDTO> checkIn(@PathVariable String employeeId, java.security.Principal principal) {
        return ResponseEntity.ok(timesheetService.checkInForEmployee(employeeId, LocalDate.now()));
    }

    @PatchMapping("/{timesheetId}/check-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'MAGASINIER', 'CAISSIER', 'RH', 'MANAGER')")
    public ResponseEntity<TimesheetDTO> checkOut(@PathVariable String timesheetId) {
        return ResponseEntity.ok(timesheetService.checkOut(timesheetId));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<List<TimesheetDTO>> getEmployeeTimesheets(
            @PathVariable String employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(timesheetService.getEmployeeTimesheets(employeeId, startDate, endDate));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH', 'MANAGER')")
    public ResponseEntity<List<TimesheetDTO>> getTimesheetsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(timesheetService.getTimesheetsByDateRange(startDate, endDate));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH')")
    public ResponseEntity<Void> deleteTimesheet(@PathVariable String id) {
        timesheetService.deleteTimesheet(id);
        return ResponseEntity.noContent().build();
    }
}
