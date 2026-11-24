package com.elvolcan.pedidos.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Datos del cliente
    @Column(nullable = false)
    private String clienteUsername;

    @Column(nullable = false)
    private String clienteNombre;

    @Column(nullable = false)
    private String direccionEntrega;

    // Coordenadas destino (Chillán por defecto si no se envían)
    private Double latitudEntrega = -36.6066;
    private Double longitudEntrega = -72.1034;

    // Referencia al catálogo en microservicio-productos (puerto 8082)
    @Column(nullable = false)
    private Long productoId;

    @Column(nullable = false)
    private String productoNombre;

    @Column(nullable = false)
    private Integer precioUnitario;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Integer totalPagar;

    // Estados: PENDIENTE, ASIGNADO, EN_CAMINO, ENTREGADO, CANCELADO
    @Column(nullable = false)
    private String estado = "PENDIENTE";

    // Repartidor asignado y su GPS en tiempo real
    private String repartidorUsername;
    private Double latitudRepartidor;
    private Double longitudRepartidor;

    // Cuadratura automática de efectivo al confirmar entrega
    @Column(nullable = false)
    private Boolean pagoRegistrado = false;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    private LocalDateTime fechaEntrega;

    public Pedido() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClienteUsername() { return clienteUsername; }
    public void setClienteUsername(String clienteUsername) { this.clienteUsername = clienteUsername; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }

    public Double getLatitudEntrega() { return latitudEntrega; }
    public void setLatitudEntrega(Double latitudEntrega) { this.latitudEntrega = latitudEntrega; }

    public Double getLongitudEntrega() { return longitudEntrega; }
    public void setLongitudEntrega(Double longitudEntrega) { this.longitudEntrega = longitudEntrega; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public String getProductoNombre() { return productoNombre; }
    public void setProductoNombre(String productoNombre) { this.productoNombre = productoNombre; }

    public Integer getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(Integer precioUnitario) { this.precioUnitario = precioUnitario; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Integer getTotalPagar() { return totalPagar; }
    public void setTotalPagar(Integer totalPagar) { this.totalPagar = totalPagar; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getRepartidorUsername() { return repartidorUsername; }
    public void setRepartidorUsername(String repartidorUsername) { this.repartidorUsername = repartidorUsername; }

    public Double getLatitudRepartidor() { return latitudRepartidor; }
    public void setLatitudRepartidor(Double latitudRepartidor) { this.latitudRepartidor = latitudRepartidor; }

    public Double getLongitudRepartidor() { return longitudRepartidor; }
    public void setLongitudRepartidor(Double longitudRepartidor) { this.longitudRepartidor = longitudRepartidor; }

    public Boolean getPagoRegistrado() { return pagoRegistrado; }
    public void setPagoRegistrado(Boolean pagoRegistrado) { this.pagoRegistrado = pagoRegistrado; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDateTime fechaEntrega) { this.fechaEntrega = fechaEntrega; }
}