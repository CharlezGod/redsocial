package com.ejemplo.redsocial.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ejemplo.redsocial.model.Reporte;

public interface ReporteRepository extends JpaRepository<Reporte, Long> {
}