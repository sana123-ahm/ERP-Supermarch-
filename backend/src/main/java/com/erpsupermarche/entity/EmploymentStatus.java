package com.erpsupermarche.entity;

public enum EmploymentStatus {
    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE"),
    ON_LEAVE("ON_LEAVE"),
    SUSPENDED("SUSPENDED"),
    TERMINATED("TERMINATED");

    private final String status;

    EmploymentStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
