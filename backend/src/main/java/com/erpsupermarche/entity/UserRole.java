package com.erpsupermarche.entity;

public enum UserRole {
    ADMIN("ADMIN"),
    MANAGER("MANAGER"),
    CAISSIER("CAISSIER"),
    MAGASINIER("MAGASINIER"),
    RH("RH");

    private final String role;

    UserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
