package tn.ooredoo.backendspringboot.websocket;

import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// ⚠️ DISABLED: This WebSocket config was interfering with Python API WebSocket connection
// The audio processing flow is: Python API ➝ Angular ➝ Spring (HTTP) for storage
// @Configuration
// @EnableWebSocketMessageBroker
// @Order(Ordered.HIGHEST_PRECEDENCE + 99)
// @RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Commented out to prevent WebSocket conflicts with Python API
    /*
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/user");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/audio")
                .setAllowedOrigins("*")
                .withSockJS();
    }
    */
}
