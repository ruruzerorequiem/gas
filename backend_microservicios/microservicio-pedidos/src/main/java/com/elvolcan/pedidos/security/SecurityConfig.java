package com.elvolcan.pedidos.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**")
                        .permitAll()
                        // Crear pedido (Cliente o Operadora)
                        .requestMatchers(HttpMethod.POST, "/api/pedidos")
                        .hasAnyAuthority("ROLE_CLIENTE", "ROLE_OPERADORA", "ROLE_ADMIN")
                        // Ver pedidos propios del cliente
                        .requestMatchers(HttpMethod.GET, "/api/pedidos/mis-pedidos")
                        .hasAnyAuthority("ROLE_CLIENTE", "ROLE_ADMIN", "ROLE_OPERADORA")
                        // Ver pedidos asignados al repartidor autenticado
                        .requestMatchers(HttpMethod.GET, "/api/pedidos/asignados").hasAuthority("ROLE_REPARTIDOR")
                        // Ver todos los pedidos del día (Operadora y Admin)
                        .requestMatchers(HttpMethod.GET, "/api/pedidos").hasAnyAuthority("ROLE_ADMIN", "ROLE_OPERADORA")
                        // Asignar repartidor (Operadora y Admin)
                        .requestMatchers(HttpMethod.PUT, "/api/pedidos/*/asignar")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_OPERADORA")
                        // Actualizar estado o ubicación GPS en ruta (Repartidor, Operadora o Admin)
                        .requestMatchers(HttpMethod.PUT, "/api/pedidos/*/estado", "/api/pedidos/*/ubicacion")
                        .hasAnyAuthority("ROLE_REPARTIDOR", "ROLE_OPERADORA", "ROLE_ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}