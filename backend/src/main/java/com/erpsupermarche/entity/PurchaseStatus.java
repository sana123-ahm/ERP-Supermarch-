package com.erpsupermarche.entity;

public enum PurchaseStatus {
    PENDING("PENDING"),
    CONFIRMED("CONFIRMED"),
    SHIPPED("SHIPPED"),
    RECEIVED("RECEIVED"),
    DELIVERED("DELIVERED"),
    CANCELLED("CANCELLED");

    private final String status;

    PurchaseStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
