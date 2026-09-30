package com.ejemplo.redsocial;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ejemplo.redsocial.model.Usuario;
import com.ejemplo.redsocial.repository.UsuarioRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;

    public DataInitializer(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.findByUser("admin").isEmpty()) {
            usuarioRepository.save(new Usuario("Administrador General", "admin", "1234", "ADMIN"));
        }
        if (usuarioRepository.findByUser("trabajador").isEmpty()) {
            usuarioRepository.save(new Usuario("Operador de Campo", "trabajador", "1234", "TRABAJADOR"));
        }
        if (usuarioRepository.findByUser("usuario").isEmpty()) {
            usuarioRepository.save(new Usuario("Ciudadano Vecino", "usuario", "1234", "USUARIO"));
        }
        System.out.println(">>> Cuentas base creadas: ADMIN (admin/1234), TRABAJADOR (trabajador/1234), USUARIO (usuario/1234) <<<");
    }
}