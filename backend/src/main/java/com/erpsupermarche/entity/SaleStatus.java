package com.erpsupermarche.entity;

public enum SaleStatus {
    PENDING("PENDING"),
    COMPLETED("COMPLETED"),
    CANCELLED("CANCELLED"),
    RETURNED("RETURNED");

    private final String status;

    SaleStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
