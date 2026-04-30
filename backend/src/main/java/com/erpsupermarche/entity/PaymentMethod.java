package com.erpsupermarche.entity;

public enum PaymentMethod {
    CASH("CASH"),
    CARD("CARD"),
    CHECK("CHECK"),
    TRANSFER("TRANSFER"),
    MOBILE_PAYMENT("MOBILE_PAYMENT");

    private final String method;

    PaymentMethod(String method) {
        this.method = method;
    }

    public String getMethod() {
        return method;
    }
}
