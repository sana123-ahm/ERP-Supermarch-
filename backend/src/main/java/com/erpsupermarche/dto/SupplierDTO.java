package com.erpsupermarche.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDTO {
    private String id;
    private String name;
    private String description;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String country;
    private String contactPerson;
    private List<String> categories;
    private String taxId;
    private Boolean active;
}
