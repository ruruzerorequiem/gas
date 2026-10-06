package com.tienda.usuarios.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrarUsuario(@RequestBody Map<String, Object> usuarioData) {
        Map<String, Object> respuesta = new HashMap<>();

        if (!usuarioData.containsKey("email") || usuarioData.get("email").toString().isEmpty()) {
            respuesta.put("error", "Bad Request");
            respuesta.put("mensaje", "El correo electrónico es obligatorio.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }

        respuesta.put("estado", "OK");
        respuesta.put("mensaje", "Usuario registrado exitosamente en el Microservicio de Usuarios.");
        respuesta.put("usuario", usuarioData);

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }
}
