package com.erpsupermarche.service;

import com.erpsupermarche.dto.EmployeeDTO;
import com.erpsupermarche.entity.Employee;
import com.erpsupermarche.entity.User;
import com.erpsupermarche.entity.EmploymentStatus;
import com.erpsupermarche.repository.EmployeeRepository;
import com.erpsupermarche.repository.UserRepository;
import com.erpsupermarche.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.erpsupermarche.entity.UserRole;
import java.math.BigDecimal;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public EmployeeDTO createEmployee(EmployeeDTO dto, String userId) {
        User user;
        if (userId != null && !userId.isEmpty()) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else {
            // Auto-create user
            String password = (dto.getPassword() != null && !dto.getPassword().isEmpty()) 
                    ? dto.getPassword() 
                    : "password123";
            user = User.builder()
                    .name(dto.getFirstName() + " " + dto.getLastName())
                    .email(dto.getEmail() != null ? dto.getEmail() : dto.getFirstName().toLowerCase() + "@erp.com")
                    .password(passwordEncoder.encode(password))
                    .role(dto.getRole() != null ? UserRole.valueOf(dto.getRole()) : UserRole.CAISSIER)
                    .phoneNumber(dto.getPhoneNumber())
                    .active(true)
                    .build();
            userRepository.save(user);
        }

        Employee employee = Employee.builder()
                .user(user)
                .employeeNumber(dto.getEmployeeNumber() != null ? dto.getEmployeeNumber() : "EMP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .dateOfBirth(dto.getDateOfBirth())
                .phoneNumber(dto.getPhoneNumber())
                .address(dto.getAddress() != null ? dto.getAddress() : "Adresse non spécifiée")
                .city(dto.getCity())
                .country(dto.getCountry())
                .position(dto.getPosition() != null ? dto.getPosition() : dto.getRole() != null ? dto.getRole() : "Employé")
                .department(dto.getDepartment() != null ? dto.getDepartment() : "Général")
                .contractType(dto.getContractType())
                .hireDate(dto.getHireDate() != null ? dto.getHireDate() : java.time.LocalDate.now())
                .salary(dto.getSalary() != null ? new BigDecimal(dto.getSalary().toString()) : BigDecimal.ZERO)
                .status(EmploymentStatus.ACTIVE)
                .active(true)
                .build();

        employeeRepository.save(employee);
        return convertToDTO(employee);
    }

    public EmployeeDTO getEmployeeById(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return convertToDTO(employee);
    }

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EmployeeDTO> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeDTO updateEmployee(String id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (dto.getFirstName() != null) employee.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) employee.setLastName(dto.getLastName());
        if (dto.getPosition() != null) employee.setPosition(dto.getPosition());
        if (dto.getContractType() != null) employee.setContractType(dto.getContractType());
        if (dto.getPhoneNumber() != null) employee.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getDepartment() != null) employee.setDepartment(dto.getDepartment());
        if (dto.getSalary() != null && !dto.getSalary().isEmpty()) {
            employee.setSalary(new BigDecimal(dto.getSalary()));
        }
        if (dto.getHireDate() != null) employee.setHireDate(dto.getHireDate());
        if (dto.getCity() != null) employee.setCity(dto.getCity());
        if (dto.getCountry() != null) employee.setCountry(dto.getCountry());
        if (dto.getAddress() != null) employee.setAddress(dto.getAddress());
        if (dto.getStatus() != null) employee.setStatus(dto.getStatus());
        if (dto.getIdNumber() != null) employee.setIdNumber(dto.getIdNumber());
        if (dto.getBankAccount() != null) employee.setBankAccount(dto.getBankAccount());

        // Update associated user
        User user = employee.getUser();
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getRole() != null) user.setRole(UserRole.valueOf(dto.getRole()));
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getFirstName() != null || dto.getLastName() != null) {
            user.setName(employee.getFirstName() + " " + employee.getLastName());
        }
        userRepository.save(user);

        employeeRepository.save(employee);
        return convertToDTO(employee);
    }

    public void deleteEmployee(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        employee.setActive(false);
        employeeRepository.save(employee);
    }

    private EmployeeDTO convertToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .id(employee.getId())
                .userId(employee.getUser().getId())
                .employeeNumber(employee.getEmployeeNumber())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getUser().getEmail())
                .role(employee.getUser().getRole().name())
                .dateOfBirth(employee.getDateOfBirth())
                .phoneNumber(employee.getPhoneNumber())
                .address(employee.getAddress())
                .city(employee.getCity())
                .country(employee.getCountry())
                .status(employee.getStatus())
                .position(employee.getPosition())
                .department(employee.getDepartment())
                .contractType(employee.getContractType())
                .hireDate(employee.getHireDate())
                .salary(employee.getSalary() != null ? employee.getSalary().toString() : "0")
                .active(employee.getActive())
                .build();
    }
}
