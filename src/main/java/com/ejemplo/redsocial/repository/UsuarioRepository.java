package com.ejemplo.redsocial.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ejemplo.redsocial.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUser(String user);
    Optional<Usuario> findByUserAndPass(String user, String pass);
}