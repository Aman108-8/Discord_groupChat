package in.AY.Backend.Entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class Messages {
	
	public String getSender() {
		return sender;
	}

	public String getContent() {
		return content;
	}

	public LocalDateTime getTimeStamp() {
		return timeStamp;
	}

	private String sender;
	private String content;
	private LocalDateTime timeStamp;
	
	public Messages(String sender, String content) {
		this.sender = sender;
		this.content = content;
		this.timeStamp = LocalDateTime.now();
	}
	
	public Messages() {}

	public void setSender(String sender) {
		this.sender = sender;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public void setTimeStamp(LocalDateTime timeStamp) {
		this.timeStamp = timeStamp;
	}
}


/*
 * Problem 1: LocalDateTime without Jackson module Jackson fails silently to serialize LocalDateTime
→ it drops fields
Problem 2: Lombok sometimes doesn’t generate getters correctly (very common when IDE Lombok plugin is missing / outdated)

Result → Jackson sees object but no visible properties
 */
