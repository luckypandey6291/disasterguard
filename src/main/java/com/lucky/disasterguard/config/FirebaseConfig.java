package com.lucky.disasterguard.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        try {
            FirebaseOptions options = null;
            String firebaseConfigJson = System.getenv("FIREBASE_CONFIG_JSON");

            if (firebaseConfigJson != null && !firebaseConfigJson.isBlank()) {
                InputStream serviceAccount = new ByteArrayInputStream(firebaseConfigJson.getBytes(StandardCharsets.UTF_8));
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
            } else {
                // Fallback to Application Default Credentials
                try {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .build();
                } catch (Exception e) {
                    System.out.println("Firebase Admin SDK: No credentials found in environment. Initializing with default options for development.");
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.newBuilder().build())
                            .setProjectId("disasterguard-6dab8")
                            .build();
                }
            }

            FirebaseApp.initializeApp(options);
            System.out.println("Firebase App successfully initialized!");
        } catch (Exception e) {
            System.err.println("Failed to initialize Firebase App: " + e.getMessage());
        }
    }
}
