package com.elvolcan.pedidos.repositories;

import com.elvolcan.pedidos.models.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByClienteUsernameOrderByFechaCreacionDesc(String clienteUsername);
    List<Pedido> findByRepartidorUsernameOrderByFechaCreacionDesc(String repartidorUsername);
    List<Pedido> findAllByOrderByFechaCreacionDesc();
}