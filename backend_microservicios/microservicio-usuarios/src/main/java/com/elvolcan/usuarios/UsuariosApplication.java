package com.elvolcan.usuarios;

import com.elvolcan.usuarios.models.Usuario;
import com.elvolcan.usuarios.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class UsuariosApplication {

    public static void main(String[] args) {
        SpringApplication.run(UsuariosApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(UsuarioRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new Usuario("admin", encoder.encode("admin123"), "Administradora El Volcán", "ROLE_ADMIN"));
                repo.save(new Usuario("operadora", encoder.encode("123456"), "Operadora Central", "ROLE_OPERADORA"));
                repo.save(new Usuario("repartidor1", encoder.encode("123456"), "Repartidor Camión 1", "ROLE_REPARTIDOR"));
            }
        };
    }
}