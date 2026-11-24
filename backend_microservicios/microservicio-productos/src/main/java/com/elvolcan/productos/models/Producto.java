package com.elvolcan.productos.models;

import jakarta.persistence.*;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Integer pesoKg;

    @Column(nullable = false)
    private Integer precio;

    @Column(nullable = false)
    private Integer stockActual;

    private String imagenUrl;

    @Column(nullable = false)
    private Boolean activo = true;

    public Producto() {}

    public Producto(String nombre, String descripcion, Integer pesoKg, Integer precio, Integer stockActual, String imagenUrl) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.pesoKg = pesoKg;
        this.precio = precio;
        this.stockActual = stockActual;
        this.imagenUrl = imagenUrl;
        this.activo = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getPesoKg() { return pesoKg; }
    public void setPesoKg(Integer pesoKg) { this.pesoKg = pesoKg; }

    public Integer getPrecio() { return precio; }
    public void setPrecio(Integer precio) { this.precio = precio; }

    public Integer getStockActual() { return stockActual; }
    public void setStockActual(Integer stockActual) { this.stockActual = stockActual; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}