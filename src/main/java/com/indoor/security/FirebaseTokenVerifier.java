package com.indoor.security;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.InputStream;

public class FirebaseTokenVerifier {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseTokenVerifier.class);
    private static boolean initialized = false;

    public static synchronized void initialize() {
        if (initialized) return;

        try {
            String serviceAccountPath = System.getenv("FIREBASE_SERVICE_ACCOUNT_KEY");
            FirebaseOptions options;

            if (serviceAccountPath != null && !serviceAccountPath.trim().isEmpty()) {
                InputStream serviceAccount = new FileInputStream(serviceAccountPath);
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                FirebaseApp.initializeApp(options);
                logger.info("Firebase Admin SDK initialized with Service Account Key.");
            } else {
                // Fallback to Application Default Credentials or dev mode
                try {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .build();
                    FirebaseApp.initializeApp(options);
                    logger.info("Firebase Admin SDK initialized with Application Default Credentials.");
                } catch (Exception e) {
                    logger.warn("Firebase Admin SDK running in local development emulation mode: {}", e.getMessage());
                }
            }
            initialized = true;
        } catch (Exception e) {
            logger.error("Failed to initialize Firebase Admin SDK", e);
        }
    }

    /**
     * Verifies the client's Firebase ID token against Firebase Auth servers.
     *
     * @param idToken Bearer token sent in Authorization header
     * @return FirebaseToken containing uid, email, and claims if valid; null otherwise
     */
    public static FirebaseToken verifyIdToken(String idToken) {
        if (idToken == null || idToken.trim().isEmpty()) {
            return null;
        }

        try {
            if (!initialized) {
                initialize();
            }

            if (FirebaseApp.getApps().isEmpty()) {
                logger.warn("FirebaseApp not initialized. Bypassing in local dev environment.");
                return null;
            }

            return FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (Exception e) {
            logger.error("Failed to verify Firebase ID Token: {}", e.getMessage());
            return null;
        }
    }
}
