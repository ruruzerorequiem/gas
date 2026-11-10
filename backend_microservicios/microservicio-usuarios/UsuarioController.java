package com.tienda.usuarios.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // Para desarrollo local. En producción se restringe al dominio del frontend.
public class UsuarioController {

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrarUsuario(@RequestBody Map<String, Object> usuarioData) {
        Map<String, Object> respuesta = new HashMap<>();

        // 1. Validar que la petición contenga datos
        if (usuarioData == null) {
            respuesta.put("error", "Bad Request");
            respuesta.put("mensaje", "No se recibieron datos de usuario.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }

        // 2. Validar correo obligatorio de forma segura (sin NullPointerException)
        Object emailObj = usuarioData.get("email");
        if (emailObj == null || emailObj.toString().trim().isEmpty()) {
            respuesta.put("error", "Bad Request");
            respuesta.put("mensaje", "El correo electrónico es obligatorio.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }

        // 3. Validar contraseña obligatoria
        Object passwordObj = usuarioData.get("password");
        if (passwordObj == null || passwordObj.toString().trim().length() < 6) {
            respuesta.put("error", "Bad Request");
            respuesta.put("mensaje", "La contraseña es obligatoria y debe tener al menos 6 caracteres.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }

        // 4. Medida de seguridad: filtrar la información devuelta (NUNCA devolver la contraseña)
        Map<String, Object> usuarioSeguro = new HashMap<>();
        Object nombreObj = usuarioData.get("nombre");
        usuarioSeguro.put("nombre", (nombreObj != null && !nombreObj.toString().trim().isEmpty()) ? nombreObj.toString().trim() : "Usuario");
        usuarioSeguro.put("email", emailObj.toString().trim());

        Object telefonoObj = usuarioData.get("telefono");
        usuarioSeguro.put("telefono", telefonoObj != null ? telefonoObj.toString().trim() : "");
        
        // Por seguridad, todo registro nuevo inicia con rol Cliente para evitar escalación de privilegios
        usuarioSeguro.put("rol", "Cliente");

        respuesta.put("estado", "OK");
        respuesta.put("mensaje", "Usuario registrado exitosamente en el Microservicio de Usuarios.");
        respuesta.put("usuario", usuarioSeguro);

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> iniciarSesion(@RequestBody Map<String, Object> credenciales) {
        Map<String, Object> respuesta = new HashMap<>();

        if (credenciales == null || credenciales.get("email") == null || credenciales.get("password") == null) {
            respuesta.put("error", "Bad Request");
            respuesta.put("mensaje", "Debes ingresar correo y contraseña.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
        }

        // Respuesta segura sin exponer credenciales
        Map<String, Object> sesionSegura = new HashMap<>();
        sesionSegura.put("email", credenciales.get("email").toString().trim());
        sesionSegura.put("rol", "Cliente");

        respuesta.put("estado", "OK");
        respuesta.put("mensaje", "Sesión iniciada correctamente.");
        respuesta.put("usuario", sesionSegura);

        return ResponseEntity.ok(respuesta);
    }
}
