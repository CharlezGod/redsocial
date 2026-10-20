package com.ejemplo.redsocial.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Convierte los errores de validación en respuestas HTTP 400 con un JSON claro:
 * { "mensaje": "...", "errores": { "campo": "mensaje" } }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.putIfAbsent(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("mensaje", "Hay datos inválidos en la solicitud.");
        cuerpo.put("errores", errores);
        return ResponseEntity.badRequest().body(cuerpo);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> manejarJsonInvalido(HttpMessageNotReadableException ex) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("mensaje",
                "El formato de los datos enviados no es válido. Revisa que los campos numéricos, como el AQI, contengan números.");
        return ResponseEntity.badRequest().body(cuerpo);
    }
}
