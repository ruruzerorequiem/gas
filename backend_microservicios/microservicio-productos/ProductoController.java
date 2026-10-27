package com.tienda.productos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarProductos() {
        List<Map<String, Object>> productos = new ArrayList<>();

        Map<String, Object> p1 = new HashMap<>();
        p1.put("id", 1);
        p1.put("nombre", "Cilindro de Gas 5 kg");
        p1.put("precio", 12500);
        p1.put("categoria", "Cilindros");
        p1.put("imagen", "img/cilindro_5kg.png");
        p1.put("descripcion", "Cilindro pequeño de 5 kg.");

        Map<String, Object> p2 = new HashMap<>();
        p2.put("id", 2);
        p2.put("nombre", "Cilindro de Gas 11 kg");
        p2.put("precio", 21900);
        p2.put("categoria", "Cilindros");
        p2.put("imagen", "img/cilindro_11kg.png");
        p2.put("descripcion", "Cilindro mediano de 11 kg.");

        productos.add(p1);
        productos.add(p2);

        return ResponseEntity.ok(productos);
    }
}
