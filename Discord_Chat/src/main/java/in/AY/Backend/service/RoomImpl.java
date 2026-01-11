package in.AY.Backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.AY.Backend.Entity.Rooms;
import in.AY.Backend.Repository.RoomRepo;

@Service
public class RoomImpl implements RoomServices
{
	@Autowired
	RoomRepo roomRepo;
	
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

}
