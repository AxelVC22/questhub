package post.client;

import com.proto.post.CreatePostRequest;
import com.proto.post.CreatePostResponse;
import com.proto.post.MediaFile;
import com.proto.post.PostServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class PostCliente {
    public static void main(String[] args) throws InterruptedException, IOException {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress("localhost", 50051)
                .usePlaintext()
                .build();

        createPost(channel);
    }

    public static void createPost(ManagedChannel channel) throws IOException {
        PostServiceGrpc.PostServiceBlockingStub postClient = PostServiceGrpc.newBlockingStub(channel);
        String[] filePaths = {
                "C:\\Users\\axel_\\Downloads\\WhatsApp Image 2025-05-12 at 11.43.14 PM.jpeg",
                "C:\\Users\\axel_\\Downloads\\WhatsApp Image 2025-05-12 at 11.43.13 PM (1).jpeg"
        };

        CreatePostRequest.Builder requestBuilder = CreatePostRequest.newBuilder()
                .setTitle("Post Title")
                .setContent("Post Content");

        for (String path : filePaths) {
            byte[] fileData = Files.readAllBytes(Paths.get(path));
            String fileName = Paths.get(path).getFileName().toString();
            String contentType = getMimeType(path);

            MediaFile media = MediaFile.newBuilder()
                    .setFilename(fileName)
                    .setData(com.google.protobuf.ByteString.copyFrom(fileData))
                    .setContentType(contentType)
                    .build();

            requestBuilder.addMultimedia(media);
        };

        CreatePostResponse response = postClient.createPost(requestBuilder.build());

        System.out.println("Post creado con id: " + response.getPost().getId());

        channel.shutdown();

    }

    private static String getMimeType(String filePath) {
        if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
        if (filePath.endsWith(".png")) return "image/png";
        if (filePath.endsWith(".mp4")) return "video/mp4";
        return "application/octet-stream";
    }
}
