package com.ejemplo.redsocial.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.ejemplo.redsocial.model.Mision;
import com.ejemplo.redsocial.model.Reporte;
import com.ejemplo.redsocial.repository.MisionRepository;
import com.ejemplo.redsocial.repository.ReporteRepository;

/**
 * Controlador de la página principal (Spring Web + Thymeleaf).
 * Entrega templates/index.html con los datos de la base ya cargados en el modelo.
 * Los @RestController (/api/...) siguen funcionando igual para el JavaScript.
 */
@Controller
public class HomeController {

    private final MisionRepository misionRepository;
    private final ReporteRepository reporteRepository;

    public HomeController(MisionRepository misionRepository, ReporteRepository reporteRepository) {
        this.misionRepository = misionRepository;
        this.reporteRepository = reporteRepository;
    }

    @GetMapping("/")
    public String inicio(Model model) {
        List<Mision> misiones = misionRepository.findAll();
        List<Reporte> reportes = reporteRepository.findAll();

        model.addAttribute("misiones", misiones);
        model.addAttribute("reportes", reportes);
        model.addAttribute("totalMisiones", misiones.size());
        model.addAttribute("totalReportes", reportes.size());
        return "index"; // -> templates/index.html
    }
}
