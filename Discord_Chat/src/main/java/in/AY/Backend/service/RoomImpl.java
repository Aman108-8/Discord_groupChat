package in.AY.Backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.AY.Backend.Entity.Messages;
import in.AY.Backend.Entity.Rooms;
import in.AY.Backend.Repository.MessageRepo;
import in.AY.Backend.Repository.RoomRepo;

@Service
public class RoomImpl implements RoomServices
{
	@Autowired
	RoomRepo roomRepo;

	@Autowired
    MessageRepo messageRepo; // Inject message repository
	
	@Override
	public Rooms CreteRoom(String roomId) {
		
		if(roomRepo.findByRoomId(roomId) != null) {
			return null;
		}
		Rooms r = new Rooms();
		r.setRoomId(roomId);
		return roomRepo.save(r);
	}

	@Override
	public Rooms getRoom(String roomId) {
		Rooms room = roomRepo.findByRoomId(roomId);
		if(room != null) {
			return room;
		}
		return null;
	}

	@Override
	public Rooms CreteRoom(Rooms room) {
		roomRepo.save(room);
		return null;
	}

	@Override
	public Messages saveMessage(Messages messages, String roomId) {
		Rooms room = getRoom(roomId);
        if (room != null) {
            // Save message first to generate ID
        	//Saves message in messages collection. Message is now permanent
            Messages savedMessage = messageRepo.save(messages);
            
            // Adds reference of message to room
            // NOT duplicating image
            // Just linking message
            room.getMessage().add(savedMessage);
            //Updates room document
            //Room now knows about this message
            roomRepo.save(room);
            
            return savedMessage;
        }
        return null;
	}

}
