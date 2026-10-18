package com.example.catalogservice.exception;

public class FileStorageException extends RuntimeException {
    public FileStorageException(String message, Throwable cause) { super(message, cause); }
}