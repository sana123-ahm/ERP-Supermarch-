package com.erpsupermarche.dto;

import com.erpsupermarche.entity.EmploymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {
    
    private String id;
    private String userId;
    private String employeeNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String address;
    private String city;
    private String country;
    private EmploymentStatus status;
    private String position;
    private String department;
    private String contractType;
    private LocalDate hireDate;
    private String salary;
    private String idNumber;
    private String bankAccount;
    private String password;
    private Boolean active;
}
