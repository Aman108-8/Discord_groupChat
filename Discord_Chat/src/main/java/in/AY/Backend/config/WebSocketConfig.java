package in.AY.Backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker	//it intimediate things which is use to route the message on server

/**
 * Defines methods for configuring message handling with simple messaging
 * protocols (for example, STOMP) from WebSocket clients.
**/
/*
 * Website (frontend) decides what to do using REST APIs
 * WebSocket is used only for live data after page is ready
*/
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer
{

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		// this enables in-memory message broker
		// any client who SUBSCRIBE to /topic/** will receive messages
		// server will PUSH message to all subscribed users automatically
		config.enableSimpleBroker("/topic");
		// client SEND message to /app/**
		// messages with this prefix go to @MessageMapping controller methods
		// this is SERVER-side entry point for websocket messages
		config.setApplicationDestinationPrefixes("/app");	//“Server, here is a message. SEND → /app/sendMessage/room123
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		// this is the websocket handshake endpoint
		// client first CONNECTS to this URL to establish websocket connection
		registry.addEndpoint("/chat")
		.setAllowedOrigins("http://localhost:5173")	//allows websocket connection only from this frontend origin (CORS)
		.withSockJS();
		// SockJS provides fallback options
		// if browser does not support WebSocket,
		// it falls back to HTTP-based transports (polling, xhr, etc.)
	}
	
}

/*
 * When you type a message:
 * Client SENDS message
→ /app/sendMessage/room123
→ Server receives

When server broadcasts message:
Server SENDS message
→ /topic/room/room123
→ All subscribed clients receive

 * 
 *
 * When user types a message, JavaScript reads it and sends it to server using /app/**.
Server processes it and broadcasts it using /topic/**.
WebSocket only keeps the connection open; JavaScript controls what is sent and what is shown.
*/
