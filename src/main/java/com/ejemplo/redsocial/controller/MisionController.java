package com.ejemplo.redsocial.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ejemplo.redsocial.model.Mision;
import com.ejemplo.redsocial.repository.MisionRepository;

@RestController
@RequestMapping("/api/misiones")
@CrossOrigin(origins = "*")
public class MisionController {

    private final MisionRepository misionRepository;

    public MisionController(MisionRepository misionRepository) {
        this.misionRepository = misionRepository;
    }

    @GetMapping
    public List<Mision> listarMisiones() {
        return misionRepository.findAll();
    }

    @PostMapping
    public Mision crearMision(@RequestBody Mision mision) {
        return misionRepository.save(mision);
    }

    @PutMapping("/{id}")
    public Mision actualizarMision(@PathVariable Long id, @RequestBody Mision mision) {
        return misionRepository.findById(id).map(existente -> {
            existente.setTitulo(mision.getTitulo());
            existente.setUbicacion(mision.getUbicacion());
            existente.setAqi(mision.getAqi());
            existente.setEstado(mision.getEstado());
            return misionRepository.save(existente);
        }).orElseGet(() -> {
            mision.setId(id);
            return misionRepository.save(mision);
        });
    }

    @DeleteMapping("/{id}")
    public void eliminarMision(@PathVariable Long id) {
        misionRepository.deleteById(id);
    }
}