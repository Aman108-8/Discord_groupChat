package in.AY.Backend.Controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import in.AY.Backend.MessageRequest;
import in.AY.Backend.Entity.Messages;
import in.AY.Backend.Entity.Rooms;
import in.AY.Backend.config.AppConstants;
import in.AY.Backend.service.RoomServices;

/*
 * Website (frontend) decides what to do using REST APIs
 * WebSocket is used only for live data after page is ready
*/
@Controller
@CrossOrigin(AppConstants.FRONT_END_BASE_URL)
public class ChatRoomController {
	
	@Autowired
	private RoomServices rs;
	
	//for sending and recieving messages
	// client SENDS message to:
	// /app/sendMessage/{roomId}
	@MessageMapping("/sendMessage/{roomId}")
	// server will BROADCAST returned message
	// to all clients SUBSCRIBED to this topic
	@SendTo("/topic/room/{roomId}") //Server, I want to RECEIVE messages of this room. SUBSCRIBE → /topic/room/room123
	public Messages sendMessage(
			@DestinationVariable String roomId,
			@RequestBody MessageRequest req) {	//WebSocket does NOT use HTTP request body so can remove @RequestBody
		Rooms room = rs.getRoom(req.getRoomId());
		Messages msg = new Messages();
		msg.setContent(req.getContent());
		msg.setSender(req.getSender());
		msg.setTimeStamp(LocalDateTime.now());
		
		if(room != null) {
			room.getMessage().add(msg);
			rs.CreteRoom(room);
		}
		else {
			throw new RuntimeException("room not found");
		}
		return msg;
	}
}
