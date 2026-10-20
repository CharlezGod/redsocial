package com.ejemplo.redsocial.validator;

import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import com.ejemplo.redsocial.model.Usuario;

/**
 * Validador personalizado que implementa la interfaz Validator de Spring.
 * Aplica reglas que involucran varios campos a la vez, algo que las anotaciones
 * de un solo campo (@NotBlank, @Size...) no pueden expresar.
 */
@Component
public class UsuarioValidator implements Validator {

    @Override
    public boolean supports(Class<?> clazz) {
        return Usuario.class.equals(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        Usuario usuario = (Usuario) target;

        if (usuario.getUser() != null && usuario.getPass() != null
                && usuario.getUser().trim().equalsIgnoreCase(usuario.getPass().trim())) {
            errors.rejectValue("pass", "pass.igual.usuario",
                    "La contraseña no puede ser igual al nombre de usuario.");
        }
    }
}
