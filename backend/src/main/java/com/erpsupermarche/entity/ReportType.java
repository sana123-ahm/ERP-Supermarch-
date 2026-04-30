package com.erpsupermarche.entity;

public enum ReportType {
    SALES("SALES"),
    PURCHASES("PURCHASES"),
    INVENTORY("INVENTORY"),
    REVENUE("REVENUE"),
    EMPLOYEE_PERFORMANCE("EMPLOYEE_PERFORMANCE"),
    FINANCIAL("FINANCIAL"),
    CUSTOM("CUSTOM");

    private final String type;

    ReportType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}
