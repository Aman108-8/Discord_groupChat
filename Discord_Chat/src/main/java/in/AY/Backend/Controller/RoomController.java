package in.AY.Backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.AY.Backend.Entity.Messages;
import in.AY.Backend.Entity.Rooms;
import in.AY.Backend.service.RoomServices;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class RoomController {

	@Autowired
	RoomServices rs;

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
}
