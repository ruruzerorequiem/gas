package com.elvolcan.productos;

import com.elvolcan.productos.models.Producto;
import com.elvolcan.productos.repositories.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ProductosApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductosApplication.class, args);
    }

    @Bean
    CommandLineRunner initProductos(ProductoRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new Producto("Cilindro Gas 5 kg", "Ideal para estufas portátiles y cocinillas", 5, 11500, 40, "/img/cilindro_5kg.png"));
                repo.save(new Producto("Cilindro Gas 11 kg", "Formato estándar para cocina doméstica", 11, 21000, 65, "/img/cilindro_11kg.png"));
                repo.save(new Producto("Cilindro Gas 15 kg", "Mayor autonomía para hogar y calefacción", 15, 27500, 50, "/img/cilindro_15kg.png"));
                repo.save(new Producto("Cilindro Gas 45 kg", "Uso comercial e industrial de alta demanda", 45, 78000, 15, "/img/cilindro_45kg.png"));
            }
        };
    }
}