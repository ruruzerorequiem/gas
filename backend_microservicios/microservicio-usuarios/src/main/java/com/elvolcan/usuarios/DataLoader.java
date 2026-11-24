package com.elvolcan.usuarios;

import com.elvolcan.usuarios.models.Usuario;
import com.elvolcan.usuarios.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Componente para cargar usuarios de prueba si la base de datos está vacía
@Component
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Si no hay usuarios en la base de datos, creamos los de prueba
        if (usuarioRepository.count() == 0) {
            System.out.println(">>> Cargando usuarios de prueba en la base de datos...");

            // 1. Administrador (acceso total)
            Usuario admin = new Usuario();
            admin.setUsername("admin@gaselvolcan.cl");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setNombreCompleto("Rodrigo Administrador");
            admin.setRol("ROLE_ADMIN");
            admin.setActivo(true);
            usuarioRepository.save(admin);

            // 2. Operadora (gestión de pedidos y despacho)
            Usuario operadora = new Usuario();
            operadora.setUsername("operadora@gaselvolcan.cl");
            operadora.setPassword(passwordEncoder.encode("opera123"));
            operadora.setNombreCompleto("Camila Despachadora");
            operadora.setRol("ROLE_OPERADORA");
            operadora.setActivo(true);
            usuarioRepository.save(operadora);

            // 3. Repartidor en ruta
            Usuario repartidor = new Usuario();
            repartidor.setUsername("repartidor@gaselvolcan.cl");
            repartidor.setPassword(passwordEncoder.encode("repa123"));
            repartidor.setNombreCompleto("Carlos Chofer Chillán");
            repartidor.setRol("ROLE_REPARTIDOR");
            repartidor.setActivo(true);
            usuarioRepository.save(repartidor);

            // 4. Cliente para realizar compras
            Usuario cliente = new Usuario();
            cliente.setUsername("cliente@gmail.com");
            cliente.setPassword(passwordEncoder.encode("cliente123"));
            cliente.setNombreCompleto("Juan Perez Chillán");
            cliente.setRol("ROLE_CLIENTE");
            cliente.setActivo(true);
            usuarioRepository.save(cliente);

            System.out.println(">>> ¡Usuarios de prueba creados exitosamente!");
        }
    }
}
