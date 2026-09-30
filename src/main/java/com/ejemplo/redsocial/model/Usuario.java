package com.ejemplo.redsocial.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    // Cambiamos el nombre físico en la BD a "username" para evitar conflictos con la palabra reservada USER en Postgres
    @Column(name = "username", unique = true, nullable = false)
    private String user;

    @Column(nullable = false)
    private String pass;

    private String rol;

    public Usuario() {}

    public Usuario(String nombre, String user, String pass, String rol) {
        this.nombre = nombre;
        this.user = user;
        this.pass = pass;
        this.rol = rol;
    }

    public Long getId() { 
        return id; 
    }

    public void setId(Long id) { 
        this.id = id; 
    }

    public String getNombre() { 
        return nombre; 
    }

    public void setNombre(String nombre) { 
        this.nombre = nombre; 
    }

    public String getUser() { 
        return user; 
    }

    public void setUser(String user) { 
        this.user = user; 
    }

    public String getPass() { 
        return pass; 
    }

    public void setPass(String pass) { 
        this.pass = pass; 
    }

    public String getRol() { 
        return rol; 
    }

    public void setRol(String rol) { 
        this.rol = rol; 
    }
}