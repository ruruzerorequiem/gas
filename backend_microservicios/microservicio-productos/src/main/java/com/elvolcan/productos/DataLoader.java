package com.elvolcan.productos;

import com.elvolcan.productos.models.Producto;
import com.elvolcan.productos.repositories.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Componente para cargar el catálogo inicial de gas si la tabla está vacía
@Component
public class DataLoader implements CommandLineRunner {

    private final ProductoRepository productoRepository;

    public DataLoader(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productoRepository.count() == 0) {
            System.out.println(">>> Cargando catálogo inicial de cilindros en la base de datos...");

            productoRepository.save(new Producto(
                    "Cilindro GLP 5 kg",
                    "Cilindro de gas licuado de petróleo 5 kg. Para uso residencial pequeño (cocina o calefacción).",
                    5,
                    6500,
                    80,
                    "/img/cilindro_5kg.png"
            ));

            productoRepository.save(new Producto(
                    "Cilindro GLP 11 kg",
                    "Cilindro estándar doméstico. El más utilizado en hogares de Chillán.",
                    11,
                    12000,
                    200,
                    "/img/cilindro_11kg.png"
            ));

            productoRepository.save(new Producto(
                    "Cilindro GLP 15 kg",
                    "Cilindro de mayor capacidad para familias o negocios de mediano consumo.",
                    15,
                    16000,
                    90,
                    "/img/cilindro_15kg.png"
            ));

            productoRepository.save(new Producto(
                    "Cilindro GLP 45 kg",
                    "Cilindro industrial para restaurantes, talleres y locales comerciales.",
                    45,
                    45000,
                    30,
                    "/img/cilindros.png"
            ));

            productoRepository.save(new Producto(
                    "Regulador doméstico estándar",
                    "Regulador de 1 etapa para cilindros de 5, 11 y 15 kg. Presión estándar 28 mbar.",
                    1,
                    8990,
                    45,
                    "/img/cilindros.png"
            ));

            productoRepository.save(new Producto(
                    "Kit conexión completo",
                    "Incluye regulador estándar, manguera certificada de 1.5 metros y abrazaderas metálicas.",
                    2,
                    12990,
                    25,
                    "/img/cilindros.png"
            ));

            System.out.println(">>> ¡Catálogo de cilindros cargado con éxito!");
        }
    }
}
