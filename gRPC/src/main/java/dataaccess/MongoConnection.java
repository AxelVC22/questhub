package dataaccess;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
//import com.mongodb.MongoClientURI;

public class MongoConnection {
    private static MongoClient mongoClient;
    private static MongoDatabase database;

    public static void connect() {
        String uri = "mongodb://localhost:27017";
        mongoClient = MongoClients.create(uri);
        database = mongoClient.getDatabase("questhubDB");
    }

    public static MongoDatabase getDatabase() {
        return database;
    }

    public static void close() {
        if (mongoClient != null) {
            mongoClient.close();
        }
    }
}