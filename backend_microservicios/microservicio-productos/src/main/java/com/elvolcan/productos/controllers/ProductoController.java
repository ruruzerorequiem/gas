package com.elvolcan.productos.controllers;

import com.elvolcan.productos.models.Producto;
import com.elvolcan.productos.repositories.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public List<Producto> listarActivos() {
        return productoRepository.findByActivoTrue();
    }

    @GetMapping("/todos")
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return productoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Producto no encontrado")));
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        producto.setActivo(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(productoRepository.save(producto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Producto datos) {
        return productoRepository.findById(id).map(producto -> {
            producto.setNombre(datos.getNombre());
            producto.setDescripcion(datos.getDescripcion());
            producto.setPesoKg(datos.getPesoKg());
            producto.setPrecio(datos.getPrecio());
            producto.setStockActual(datos.getStockActual());
            producto.setImagenUrl(datos.getImagenUrl());
            if (datos.getActivo() != null) {
                producto.setActivo(datos.getActivo());
            }
            return ResponseEntity.ok((Object) productoRepository.save(producto));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Producto no encontrado")));
    }

    @PutMapping("/{id}/descontar")
    public ResponseEntity<?> descontarStock(@PathVariable Long id, @RequestParam Integer cantidad) {
        if (cantidad == null || cantidad <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "La cantidad debe ser mayor a 0"));
        }

        return productoRepository.findById(id).map(producto -> {
            if (producto.getStockActual() < cantidad) {
                return ResponseEntity.badRequest()
                        .body((Object) Map.of("error", "Stock insuficiente para " + producto.getNombre()));
            }
            producto.setStockActual(producto.getStockActual() - cantidad);
            return ResponseEntity.ok((Object) productoRepository.save(producto));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Producto no encontrado")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean permanente) {
        return productoRepository.findById(id).map(producto -> {
            if (permanente) {
                productoRepository.delete(producto);
                return ResponseEntity.ok((Object) Map.of("mensaje", "Producto eliminado definitivamente de MySQL"));
            } else {
                producto.setActivo(false);
                productoRepository.save(producto);
                return ResponseEntity.ok((Object) Map.of("mensaje", "Producto desactivado del catálogo"));
            }
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Producto no encontrado")));
    }
}