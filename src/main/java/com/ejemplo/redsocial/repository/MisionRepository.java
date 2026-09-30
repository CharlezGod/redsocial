package com.ejemplo.redsocial.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ejemplo.redsocial.model.Mision;

public interface MisionRepository extends JpaRepository<Mision, Long> {
}