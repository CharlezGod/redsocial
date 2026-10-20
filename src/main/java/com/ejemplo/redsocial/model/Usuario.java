package com.ejemplo.redsocial.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre completo es obligatorio.")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres.")
    private String nombre;

    // Cambiamos el nombre físico en la BD a "username" para evitar conflictos con la palabra reservada USER en Postgres
    @NotBlank(message = "El usuario es obligatorio.")
    @Size(min = 3, max = 30, message = "El usuario debe tener entre 3 y 30 caracteres.")
    @Pattern(regexp = "^[A-Za-z0-9_.]+$", message = "El usuario solo puede tener letras, números, punto y guion bajo.")
    @Column(name = "username", unique = true, nullable = false)
    private String user;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 4, max = 50, message = "La contraseña debe tener entre 4 y 50 caracteres.")
    @Column(nullable = false)
    private String pass;

    @Pattern(regexp = "ADMIN|TRABAJADOR|USUARIO", message = "El rol debe ser ADMIN, TRABAJADOR o USUARIO.")
    private String rol;

    public Usuario() {}

    public Usuario(String nombre, String user, String pass, String rol) {
        this.nombre = nombre;
        this.user = user;
        this.pass = pass;
        this.rol = rol;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public String getPass() { return pass; }
    public void setPass(String pass) { this.pass = pass; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
}
