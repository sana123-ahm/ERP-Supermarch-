package com.erpsupermarche.entity;

public enum LeaveType {
    ANNUAL("ANNUAL"),
    SICK("SICK"),
    PERSONAL("PERSONAL"),
    MATERNITY("MATERNITY"),
    PATERNITY("PATERNITY"),
    UNPAID("UNPAID");

    private final String type;

    LeaveType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}
