package com.ejemplo.redsocial.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "misiones")
public class Mision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título de la misión es obligatorio.")
    @Size(max = 255, message = "El título no puede superar los 255 caracteres.")
    private String titulo;

    @NotBlank(message = "La ubicación es obligatoria.")
    @Size(max = 255, message = "La ubicación no puede superar los 255 caracteres.")
    private String ubicacion;

    @Min(value = 0, message = "El AQI no puede ser negativo.")
    @Max(value = 500, message = "El AQI no puede superar 500.")
    private Integer aqi;

    @NotBlank(message = "El estado es obligatorio.")
    @Pattern(regexp = "Pendiente|En Curso|Completada", message = "El estado debe ser Pendiente, En Curso o Completada.")
    private String estado;

    public Mision() {}

    public Mision(String titulo, String ubicacion, Integer aqi, String estado) {
        this.titulo = titulo;
        this.ubicacion = ubicacion;
        this.aqi = aqi;
        this.estado = estado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public Integer getAqi() { return aqi; }
    public void setAqi(Integer aqi) { this.aqi = aqi; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
