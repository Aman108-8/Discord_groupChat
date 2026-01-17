package in.AY.Backend.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.bson.codecs.OverridableUuidRepresentationUuidCodec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import in.AY.Backend.Entity.Messages;
import in.AY.Backend.Entity.Rooms;
import in.AY.Backend.service.RoomServices;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class RoomController {

	@Autowired
	RoomServices rs;
	
	//SimpMessagingTemplate is in simple word Spring’s WebSocket sender
	/*
	 * Without it:
		You must manually manage sockets
		Serialize JSON
		Track clients
		
	   With it:
		One line broadcast
		Thread-safe
		Integrated with STOMP
	 */
	@Autowired
    private SimpMessagingTemplate messagingTemplate; 

	// create Room
	// roomId is sent in HTTP body
	// example body: "room123"
	@PostMapping
	public ResponseEntity<?> CreateRoom(@RequestBody String roomId) {
		Rooms room = rs.CreteRoom(roomId);
		if (room == null) {
			return ResponseEntity.badRequest().body("Room already Exist");
		}
		return ResponseEntity.status(HttpStatus.CREATED).body(room);
	}

	// get Room
	// roomId comes from URL path (PathVariable)
	@GetMapping("/{roomId}")
	public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
		Rooms room = rs.getRoom(roomId);
		if (room == null) {
			return ResponseEntity.badRequest().body("Room not found");
		}
		return ResponseEntity.ok(room);
	}

	// get messages of room
	// request params are optional query parameters
	// example: /rooms/room1/messages?page=1&size=10

	@GetMapping("/{roomId}/messages")
	public ResponseEntity<List<Messages>> getMessage(@PathVariable String roomId,
			@RequestParam(value = "page", defaultValue = "0", required = false) int page,
			@RequestParam(value = "size", defaultValue = "20", required = false) int size) {
		Rooms room = rs.getRoom(roomId);
		if (room == null) {
			return ResponseEntity.badRequest().build();
		}
		
		//get message :
		//pagination
		List<Messages> msg = room.getMessage();
		
		int start = Math.max(0, msg.size() - (page + 1) * size);
		int end = Math.min(msg.size(), start+size);
		
		List<Messages> paginationMsg = msg.subList(start, end);
		
		return ResponseEntity.ok(paginationMsg);

	}
	
	@PostMapping("/upload")
	public ResponseEntity<?> uploadImage(
	        @RequestParam("image") MultipartFile file,
	        @RequestParam("roomId") String roomId,
	        @RequestParam("sender") String sender) {
	    
	    try {
	        // Generate unique filename. Prevents filename collision, Even if 2 users upload same image name
	        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
	        Path path = Paths.get("uploads/" + filename);	//Represents file path of folder
	        
	        Files.createDirectories(path.getParent());	//If uploads/ folder doesn’t exist → create it
	        
	        /*
	         * Reads binary bytes from uploaded file
			 * Writes them to disk for store
	         */
	        Files.write(path, file.getBytes());
	        
	        //This URL points to saved file so that browser can access because of MvcConfig
	        String imageUrl = "http://localhost:8080/uploads/" + filename;
	        
	        // Create message object
	        // You are creating message internally. So DTO not needed
	        Messages message = new Messages();
	        message.setContent(imageUrl);	//Instead of storing image bytes in DB, Store only URL. Lightweight & scalable
	        message.setSender(sender);
	        message.setTimeStamp(LocalDateTime.now());
	        message.setType("IMAGE");
	        
	        // Save message via service (ID will be auto-generated)
	        Messages savedMessage = rs.saveMessage(message, roomId);
	        
	        if (savedMessage != null) {
	            // Broadcast via WebSocket
	        	//Send to all users subscribed to this room
	        	//Internally:
	        	//Converts Java object → JSON
	        	//Sends to STOMP broker. Pushes message to all subscribers. Real-time message delivery
	            messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);
	            
	            //HTTP response for uploader only
	            //WebSocket already handled chat update
	            return ResponseEntity.ok(Map.of(
	                "url", imageUrl,
	                "message", savedMessage
	            ));
	        }
	        
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Room not found");
	        
	    } catch (IOException e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Failed to upload image");
	    }
	}
	
	//{filename:.+} allows dots in filename
	// It is called AFTER upload, when chat renders
	@GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        try {
        	//get image for path
            Path path = Paths.get("uploads/" + filename);
            /*
             * Reads file from disk
			 * Converts to byte array
			 * Sends to browser
             */
            byte[] image = Files.readAllBytes(path);
            return ResponseEntity.ok()
                    .header("Content-Type", Files.probeContentType(path))
                    .body(image);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
