package com.elvolcan.pedidos.controllers;

import com.elvolcan.pedidos.models.Pedido;
import com.elvolcan.pedidos.repositories.PedidoRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository pedidoRepository;
    private final RestTemplate restTemplate;

    @Value("${productos.service.url}")
    private String productosServiceUrl;

    public PedidoController(PedidoRepository pedidoRepository, RestTemplate restTemplate) {
        this.pedidoRepository = pedidoRepository;
        this.restTemplate = restTemplate;
    }

    // 1. Cliente crea pedido (o Operadora por llamada telefónica)
    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@RequestBody Pedido pedido, Authentication auth) {
        if (pedido.getClienteUsername() == null || pedido.getClienteUsername().isBlank()) {
            pedido.setClienteUsername(auth.getName());
        }
        pedido.setTotalPagar(pedido.getPrecioUnitario() * pedido.getCantidad());
        pedido.setEstado("PENDIENTE");
        pedido.setPagoRegistrado(false);
        pedido.setFechaCreacion(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoRepository.save(pedido));
    }

    // 2. Operadora y Admin ven todos los pedidos del día
    @GetMapping
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAllByOrderByFechaCreacionDesc();
    }

    // 3. Cliente consulta su historial y estado en tiempo real
    @GetMapping("/mis-pedidos")
    public List<Pedido> listarMisPedidos(Authentication auth) {
        return pedidoRepository.findByClienteUsernameOrderByFechaCreacionDesc(auth.getName());
    }

    // 4. Repartidor ve SOLO sus pedidos asignados
    @GetMapping("/asignados")
    public List<Pedido> listarAsignados(Authentication auth) {
        return pedidoRepository.findByRepartidorUsernameOrderByFechaCreacionDesc(auth.getName());
    }

    // 5. Detalle de un pedido (para seguimiento en mapa)
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return pedidoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Pedido no encontrado")));
    }

    // 6. Operadora asigna el pedido a un repartidor
    @PutMapping("/{id}/asignar")
    public ResponseEntity<?> asignarRepartidor(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String repartidor = body.get("repartidorUsername");
        if (repartidor == null || repartidor.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Debe indicar el username del repartidor"));
        }

        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setRepartidorUsername(repartidor);
            pedido.setEstado("ASIGNADO");
            return ResponseEntity.ok((Object) pedidoRepository.save(pedido));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Pedido no encontrado")));
    }

    // 7. Repartidor actualiza ubicación GPS en ruta para el mapa interactivo
    @PutMapping("/{id}/ubicacion")
    public ResponseEntity<?> actualizarUbicacion(@PathVariable Long id, @RequestBody Map<String, Double> coords) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setLatitudRepartidor(coords.get("latitud"));
            pedido.setLongitudRepartidor(coords.get("longitud"));
            return ResponseEntity.ok((Object) pedidoRepository.save(pedido));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Pedido no encontrado")));
    }

    // 8. Repartidor cambia estado (EN_CAMINO / ENTREGADO -> registra pago y descuenta stock)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id,
                                              @RequestBody Map<String, String> body,
                                              HttpServletRequest request) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Debe indicar el nuevo estado"));
        }

        return pedidoRepository.findById(id).map(pedido -> {
            // Si pasa a ENTREGADO por primera vez, descuenta stock en microservicio-productos y registra pago
            if ("ENTREGADO".equalsIgnoreCase(nuevoEstado) && !"ENTREGADO".equalsIgnoreCase(pedido.getEstado())) {
                try {
                    String url = productosServiceUrl + "/api/productos/" + pedido.getProductoId()
                            + "/descontar?cantidad=" + pedido.getCantidad();
                    HttpHeaders headers = new HttpHeaders();
                    headers.set("Authorization", request.getHeader("Authorization"));
                    HttpEntity<Void> entity = new HttpEntity<>(headers);

                    restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body((Object) Map.of("error", "No se pudo descontar stock: " + e.getMessage()));
                }

                pedido.setPagoRegistrado(true);
                pedido.setFechaEntrega(LocalDateTime.now());
            }

            pedido.setEstado(nuevoEstado.toUpperCase());
            return ResponseEntity.ok((Object) pedidoRepository.save(pedido));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Pedido no encontrado")));
    }

    // 9. Actualización completa de pedido (Admin y Operadora pueden editar cliente, dirección, cantidad, repartidor, estado)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPedidoCompleto(@PathVariable Long id, @RequestBody Pedido datos) {
        return pedidoRepository.findById(id).map(pedido -> {
            if (datos.getClienteNombre() != null) pedido.setClienteNombre(datos.getClienteNombre());
            if (datos.getDireccionEntrega() != null) pedido.setDireccionEntrega(datos.getDireccionEntrega());
            if (datos.getCantidad() != null && datos.getCantidad() > 0) {
                pedido.setCantidad(datos.getCantidad());
                if (pedido.getPrecioUnitario() != null) {
                    pedido.setTotalPagar(pedido.getPrecioUnitario() * datos.getCantidad());
                }
            }
            if (datos.getRepartidorUsername() != null) pedido.setRepartidorUsername(datos.getRepartidorUsername());
            if (datos.getEstado() != null) pedido.setEstado(datos.getEstado().toUpperCase());
            if (datos.getPagoRegistrado() != null) pedido.setPagoRegistrado(datos.getPagoRegistrado());
            return ResponseEntity.ok((Object) pedidoRepository.save(pedido));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Pedido no encontrado")));
    }

    // 10. Eliminar / Cancelar pedido (Admin u Operadora)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarPedido(@PathVariable Long id) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setEstado("CANCELADO");
            pedidoRepository.save(pedido);
            return ResponseEntity.ok((Object) Map.of("mensaje", "Pedido cancelado"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Pedido no encontrado")));
    }
}