package in.AY.Backend.service;

import in.AY.Backend.Entity.Rooms;
import in.AY.Backend.Repository.RoomRepo;

public interface RoomServices {
	public Rooms CreteRoom(String roomId);
	public Rooms CreteRoom(Rooms room);
	public Rooms getRoom(String roomId);
}
