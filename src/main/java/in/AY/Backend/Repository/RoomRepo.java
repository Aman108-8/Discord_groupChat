package in.AY.Backend.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.cdi.MongoRepositoryBean;

import in.AY.Backend.Entity.Rooms;

public interface RoomRepo extends MongoRepository<Rooms, String>
{
	Rooms findByRoomId(String roomId);
}
