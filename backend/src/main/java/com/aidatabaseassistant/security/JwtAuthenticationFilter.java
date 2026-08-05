package com.aidatabaseassistant.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.aidatabaseassistant.audit.service.AuditFacade;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.servlet.HandlerExceptionResolver;
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final HandlerExceptionResolver exceptionResolver;
    private final AuditFacade auditFacade;

    public JwtAuthenticationFilter(
            JwtService jwtService, 
            UserDetailsService userDetailsService,
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver exceptionResolver,
            AuditFacade auditFacade
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.exceptionResolver = exceptionResolver;
        this.auditFacade = auditFacade;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            userEmail = jwtService.extractUsername(jwt);
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            String email = "Unknown";
            try {
                email = jwtService.extractUsername(jwt);
            } catch (Exception ignored) {}
            auditFacade.logInvalidJwt(email, e.getMessage());
            // Ignore the exception and allow the request to proceed as unauthenticated.
            // Spring Security's authorization rules will deny access later if the endpoint is protected.
        }
        
        filterChain.doFilter(request, response);
    }
}
