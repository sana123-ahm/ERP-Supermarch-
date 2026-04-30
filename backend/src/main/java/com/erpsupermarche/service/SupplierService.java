package com.erpsupermarche.service;

import com.erpsupermarche.dto.SupplierDTO;
import com.erpsupermarche.entity.Supplier;
import com.erpsupermarche.repository.SupplierRepository;
import com.erpsupermarche.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public SupplierDTO createSupplier(SupplierDTO dto) {
        Supplier supplier = Supplier.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .address(dto.getAddress())
                .city(dto.getCity())
                .country(dto.getCountry())
                .contactPerson(dto.getContactPerson())
                .categories(joinCategories(dto.getCategories()))
                .taxId(dto.getTaxId())
                .active(true)
                .build();

        supplierRepository.save(supplier);
        return convertToDTO(supplier);
    }

    public SupplierDTO getSupplierById(String id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        return convertToDTO(supplier);
    }

    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SupplierDTO updateSupplier(String id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        if (dto.getName() != null) supplier.setName(dto.getName());
        if (dto.getEmail() != null) supplier.setEmail(dto.getEmail());
        if (dto.getPhoneNumber() != null) supplier.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getAddress() != null) supplier.setAddress(dto.getAddress());
        if (dto.getCity() != null) supplier.setCity(dto.getCity());
        if (dto.getCountry() != null) supplier.setCountry(dto.getCountry());
        if (dto.getContactPerson() != null) supplier.setContactPerson(dto.getContactPerson());
        if (dto.getCategories() != null) supplier.setCategories(joinCategories(dto.getCategories()));
        if (dto.getTaxId() != null) supplier.setTaxId(dto.getTaxId());

        supplierRepository.save(supplier);
        return convertToDTO(supplier);
    }

    public void deleteSupplier(String id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    private SupplierDTO convertToDTO(Supplier supplier) {
        return SupplierDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .description(supplier.getDescription())
                .email(supplier.getEmail())
                .phoneNumber(supplier.getPhoneNumber())
                .address(supplier.getAddress())
                .city(supplier.getCity())
                .country(supplier.getCountry())
                .contactPerson(supplier.getContactPerson())
                .categories(splitCategories(supplier.getCategories()))
                .taxId(supplier.getTaxId())
                .active(supplier.getActive())
                .build();
    }

    private String joinCategories(List<String> categories) {
        if (categories == null) {
            return null;
        }

        return categories.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(category -> !category.isEmpty())
                .distinct()
                .collect(Collectors.joining(","));
    }

    private List<String> splitCategories(String categories) {
        if (categories == null || categories.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(categories.split(","))
                .map(String::trim)
                .filter(category -> !category.isEmpty())
                .collect(Collectors.toList());
    }
}
