package com.elvolcan.usuarios.repositories;

import com.elvolcan.usuarios.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Método clave para que Spring Security busque al usuario al momento del Login
    Optional<Usuario> findByUsername(String username);
}