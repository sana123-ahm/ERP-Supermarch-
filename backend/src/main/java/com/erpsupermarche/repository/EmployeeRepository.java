package com.erpsupermarche.repository;

import com.erpsupermarche.entity.Employee;
import com.erpsupermarche.entity.EmploymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    Optional<Employee> findByUserId(String userId);
    Optional<Employee> findByUserEmail(String email);
    Optional<Employee> findByEmployeeNumber(String employeeNumber);
    List<Employee> findByDepartment(String department);
    List<Employee> findByStatus(EmploymentStatus status);
    List<Employee> findByActiveTrue();
    List<Employee> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
}
