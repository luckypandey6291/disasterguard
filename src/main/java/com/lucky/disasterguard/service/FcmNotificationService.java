package com.lucky.disasterguard.service;

import com.google.firebase.messaging.*;
import com.lucky.disasterguard.entity.Notification;
import com.lucky.disasterguard.entity.Role;
import com.lucky.disasterguard.entity.User;
import com.lucky.disasterguard.entity.UserDevice;
import com.lucky.disasterguard.repository.NotificationRepository;
import com.lucky.disasterguard.repository.UserDeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FcmNotificationService {

    @Autowired
    private UserDeviceRepository userDeviceRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendToUser(User user, String title, String body, String type, Map<String, String> data) {
        if (user == null) return;

        // 1. Persist notification for in-app center
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(body);
        notification.setType(type);
        notificationRepository.save(notification);

        // 2. Fetch user's active device tokens
        List<UserDevice> devices = userDeviceRepository.findByUserIdAndActiveTrue(user.getId());
        if (devices.isEmpty()) return;

        List<String> tokens = devices.stream().map(UserDevice::getFcmToken).collect(Collectors.toList());
        sendPushToTokens(tokens, title, body, data);
    }

    public void sendToRole(Role role, String title, String body, String type, Map<String, String> data) {
        List<UserDevice> devices = userDeviceRepository.findActiveDevicesByRole(role);
        if (devices.isEmpty()) return;

        List<String> tokens = devices.stream().map(UserDevice::getFcmToken).collect(Collectors.toList());
        sendPushToTokens(tokens, title, body, data);
    }

    public void sendToAll(String title, String body, String type, Map<String, String> data) {
        List<UserDevice> devices = userDeviceRepository.findAllActiveDevices();
        if (devices.isEmpty()) return;

        List<String> tokens = devices.stream().map(UserDevice::getFcmToken).collect(Collectors.toList());
        sendPushToTokens(tokens, title, body, data);
    }

    private void sendPushToTokens(List<String> tokens, String title, String body, Map<String, String> data) {
        if (tokens.isEmpty()) return;

        try {
            MulticastMessage.Builder builder = MulticastMessage.builder()
                    .setNotification(com.google.firebase.messaging.Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .addAllTokens(tokens);

            if (data != null && !data.isEmpty()) {
                builder.putAllData(data);
            }

            BatchResponse response = FirebaseMessaging.getInstance().sendMulticast(builder.build());
            if (response.getFailureCount() > 0) {
                List<SendResponse> responses = response.getResponses();
                for (int i = 0; i < responses.size(); i++) {
                    if (!responses.get(i).isSuccessful()) {
                        String invalidToken = tokens.get(i);
                        userDeviceRepository.findByFcmToken(invalidToken).ifPresent(device -> {
                            device.setActive(false);
                            userDeviceRepository.save(device);
                        });
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("FCM Push delivery log: " + e.getMessage());
        }
    }
}
