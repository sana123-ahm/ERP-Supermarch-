package com.erpsupermarche.entity;

public enum TimesheetStatus {
    OPEN("OPEN"),
    SUBMITTED("SUBMITTED"),
    APPROVED("APPROVED"),
    REJECTED("REJECTED");

    private final String status;

    TimesheetStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
