package post.server;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.proto.post.*;
import io.grpc.stub.StreamObserver;
import dataaccess.*;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.bson.Document;

public class PostServerImplementation extends PostServiceGrpc.PostServiceImplBase {

    @Override
    public void createPost(CreatePostRequest request, StreamObserver<CreatePostResponse> responseObserver) {
        MongoConnection.connect();
        MongoDatabase database = MongoConnection.getDatabase();
        MongoCollection<Document> posts = database.getCollection("posts");

        List<Document> multimediaList = new ArrayList<>();

        for (MediaFile mediaFile : request.getMultimediaList()) {
            String filename = mediaFile.getFilename();
            byte[] fileData = mediaFile.getData().toByteArray();
            String contentType = mediaFile.getContentType();

            String uploadDirectory = "C:\\questhub-uploads\\posts\\";
            String fullPath = uploadDirectory + filename;


            File dir = new File(uploadDirectory);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            try (FileOutputStream fos = new FileOutputStream(fullPath)) {
                fos.write(fileData);
            } catch (IOException e) {
                responseObserver.onError(e);
                return;
            }

            Document mediaDocument = new Document("filename", filename)
                    .append("content_type", contentType)
                    .append("file_url", fullPath);

            multimediaList.add(mediaDocument);
        }

        Document document = new Document("title", request.getTitle())
                .append("content", request.getContent())
                .append("author_id", request.getAuthorId())
                .append("category_id", request.getCategoryId())
                .append("is_resolved", false)
                .append("created_at", Instant.now().toString())
                .append("multimedia", multimediaList);

        posts.insertOne(document);

        Post post = Post.newBuilder()
                .setId(document.getObjectId("_id").toString())
                .setTitle(request.getTitle())
                .setContent(request.getContent())
                .setAuthorId(request.getAuthorId())
                .setCategoryId(request.getCategoryId())
                .setIsResolved(false)
                .setCreatedAt(document.getString("created_at"))
                .addAllMultimedia(request.getMultimediaList())
                .build();

        CreatePostResponse response = CreatePostResponse.newBuilder().setPost(post).build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getPost(GetPostRequest request, StreamObserver<GetPostResponse> responseObserver) {

    }

    @Override
    public void updatePost(UpdatePostRequest request, StreamObserver<UpdatePostResponse> responseObserver) {

    }

    @Override
    public void deletePost(DeletePostRequest request, StreamObserver<DeletePostResponse> responseObserver) {

    }

}
