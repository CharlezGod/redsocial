package com.ejemplo.redsocial.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ejemplo.redsocial.model.Usuario;
import com.ejemplo.redsocial.repository.UsuarioRepository;
import com.ejemplo.redsocial.validator.UsuarioValidator;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioValidator usuarioValidator;

    public AuthController(UsuarioRepository usuarioRepository, UsuarioValidator usuarioValidator) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioValidator = usuarioValidator;
    }

    // Suma el validador personalizado a las anotaciones de la entidad Usuario
    @InitBinder("usuario")
    public void configurarValidador(WebDataBinder binder) {
        binder.addValidators(usuarioValidator);
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody Usuario usuario) {
        if (usuarioRepository.findByUser(usuario.getUser()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Ese nombre de usuario ya está ocupado."));
        }
        Usuario nuevo = usuarioRepository.save(usuario);
        return ResponseEntity.ok(nuevo);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        Optional<Usuario> userOpt = usuarioRepository.findByUserAndPass(usuario.getUser(), usuario.getPass());
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.status(401).body("Usuario o contraseña incorrectos.");
    }
}
