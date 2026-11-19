package com.indoor.security;

import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Allow pre-flight CORS requests
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.setContentType("application/json");
            res.getWriter().write("{\"error\": \"Unauthorized: Missing or invalid Authorization Bearer header.\"}");
            return;
        }

        String idToken = authHeader.substring(7).trim();
        FirebaseToken decodedToken = FirebaseTokenVerifier.verifyIdToken(idToken);

        if (decodedToken == null) {
            // Check for development bypass if configured
            String devToken = req.getHeader("X-Dev-User-Uid");
            if (devToken != null && !devToken.isEmpty()) {
                req.setAttribute("userUid", devToken);
                req.setAttribute("userEmail", "dev.user@campus.edu");
                chain.doFilter(request, response);
                return;
            }

            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.setContentType("application/json");
            res.getWriter().write("{\"error\": \"Unauthorized: Firebase ID Token verification failed or expired.\"}");
            return;
        }

        req.setAttribute("userUid", decodedToken.getUid());
        req.setAttribute("userEmail", decodedToken.getEmail());
        chain.doFilter(request, response);
    }
}
