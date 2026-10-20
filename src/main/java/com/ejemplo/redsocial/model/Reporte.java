package com.ejemplo.redsocial.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "reportes")
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La latitud es obligatoria.")
    @DecimalMin(value = "-90.0", message = "La latitud debe estar entre -90 y 90.")
    @DecimalMax(value = "90.0", message = "La latitud debe estar entre -90 y 90.")
    private Double lat;

    @NotNull(message = "La longitud es obligatoria.")
    @DecimalMin(value = "-180.0", message = "La longitud debe estar entre -180 y 180.")
    @DecimalMax(value = "180.0", message = "La longitud debe estar entre -180 y 180.")
    private Double lng;

    @Min(value = 0, message = "El AQI no puede ser negativo.")
    @Max(value = 500, message = "El AQI no puede superar 500.")
    private Integer aqi;

    @NotBlank(message = "La descripción del reporte es obligatoria.")
    @Size(max = 200, message = "La descripción no puede superar los 200 caracteres.")
    private String descripcion;

    public Reporte() {}

    public Reporte(Double lat, Double lng, Integer aqi, String descripcion) {
        this.lat = lat;
        this.lng = lng;
        this.aqi = aqi;
        this.descripcion = descripcion;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Integer getAqi() { return aqi; }
    public void setAqi(Integer aqi) { this.aqi = aqi; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
