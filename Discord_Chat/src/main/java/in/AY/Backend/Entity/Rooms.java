package in.AY.Backend.Entity;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class Rooms {
	@Id
	private String id;	//mongodb : unique identifier
	private String roomId;
	
	private List<Messages> messages = new ArrayList<>();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getRoomId() {
		return roomId;
	}

	public void setRoomId(String roomId) {
		this.roomId = roomId;
	}

	public List<Messages> getMessage() {
		return messages;
	}

	public void setMessage(List<Messages> messages) {
		this.messages = messages;
	}
	
}
