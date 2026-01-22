package in.AY.Backend.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import in.AY.Backend.Entity.Messages;

public interface MessageRepo extends MongoRepository<Messages, String> {
    // MongoDB will handle ID generation automatically
}