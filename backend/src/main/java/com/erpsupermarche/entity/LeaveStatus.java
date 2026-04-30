package com.erpsupermarche.entity;

public enum LeaveStatus {
    PENDING("PENDING"),
    APPROVED("APPROVED"),
    REJECTED("REJECTED"),
    CANCELLED("CANCELLED");

    private final String status;

    LeaveStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
