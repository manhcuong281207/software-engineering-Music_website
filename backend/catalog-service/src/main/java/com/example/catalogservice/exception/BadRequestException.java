package com.example.catalogservice.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}