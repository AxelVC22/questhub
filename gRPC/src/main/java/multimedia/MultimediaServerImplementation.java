package multimedia;

import com.proto.multimedia.MultimediaServiceGrpc;
import com.proto.multimedia.UploadRequest;
import com.proto.multimedia.UploadResponse;
import com.proto.multimedia.GetMultimediaRequest;
import com.proto.multimedia.GetMultimediaResponse;
import com.proto.multimedia.MultimediaItem;
import dataaccess.MongoConnection;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import org.bson.Document;
import io.grpc.stub.StreamObserver;
import com.google.protobuf.ByteString;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class MultimediaServerImplementation extends MultimediaServiceGrpc.MultimediaServiceImplBase {

    private static final String UPLOAD_DIR = "C:/questhub-uploads/posts/";

    @Override
    public StreamObserver<UploadRequest> upload(StreamObserver<UploadResponse> responseObserver) {

        MongoConnection.connect();
        MongoCollection<Document> postsCollection = MongoConnection.getDatabase().getCollection("posts");

        final String[] postIdHolder = new String[1];
        final String[] fileNameHolder = new String[1];
        final String[] contentTypeHolder = new String[1];
        final List<ByteString> dataChunks = new ArrayList<>();

        return new StreamObserver<UploadRequest>() {

            @Override
            public void onNext(UploadRequest req) {
                if (postIdHolder[0] == null) {
                    postIdHolder[0] = req.getPostId();
                    fileNameHolder[0] = req.getFilename();
                    contentTypeHolder[0] = req.getContentType();
                }

                dataChunks.add(req.getData());
            }

            @Override
            public void onError(Throwable t) {
                System.err.println("Upload cancelled: " + t.getMessage());
            }

            @Override
            public void onCompleted() {
                try {
                    if (postIdHolder[0] == null || postIdHolder[0].isEmpty()) {
                        responseObserver.onError(new Throwable("postId is missing in request"));
                        return;
                    }

                    File uploadDir = new File(UPLOAD_DIR);
                    if (!uploadDir.exists()) uploadDir.mkdirs();

                    // Generar un nombre de archivo seguro y único
                    String safeFilename = fileNameHolder[0].replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
                    String timestamp = String.valueOf(Instant.now().toEpochMilli());
                    String fileExtension = "";

                    int dotIndex = safeFilename.lastIndexOf('.');
                    if (dotIndex >= 0) {
                        fileExtension = safeFilename.substring(dotIndex);
                        safeFilename = safeFilename.substring(0, dotIndex);
                    }

                    String uniqueFilename = safeFilename + "_" + timestamp + fileExtension;
                    File file = new File(uploadDir, uniqueFilename);

                    // Escribir los chunks al archivo
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        for (ByteString chunk : dataChunks) {
                            fos.write(chunk.toByteArray());
                        }
                    }

                    String fileUrl = file.getAbsolutePath();

                    // Crear documento multimedia
                    Document multimediaDoc = new Document()
                            .append("filename", uniqueFilename)
                            .append("original_filename", fileNameHolder[0])
                            .append("content_type", contentTypeHolder[0])
                            .append("file_url", fileUrl)
                            .append("uploaded_at", Instant.now().toString());

                    // Actualizar el post en MongoDB
                    postsCollection.updateOne(
                            Filters.eq("_id", new org.bson.types.ObjectId(postIdHolder[0])),
                            Updates.push("multimedia", multimediaDoc)
                    );

                    // Responder con el URL del archivo
                    responseObserver.onNext(UploadResponse.newBuilder().setUrl(fileUrl).build());
                    responseObserver.onCompleted();

                } catch (Exception e) {
                    System.err.println("Upload failed: " + e.getMessage());
                    responseObserver.onError(e);
                }
            }
        };
    }


    @Override
    public void getMultimedia(GetMultimediaRequest request, StreamObserver<GetMultimediaResponse> responseObserver) {
        try {
            MongoConnection.connect();
            MongoCollection<Document> postsCollection = MongoConnection.getDatabase().getCollection("posts");

            String postId = request.getPostId();
            if (postId == null || postId.isEmpty()) {
                responseObserver.onError(new IllegalArgumentException("Post ID is required"));
                return;
            }

            Document post = postsCollection.find(Filters.eq("_id", new org.bson.types.ObjectId(postId))).first();

            if (post == null) {
                responseObserver.onError(new IllegalArgumentException("Post not found with ID: " + postId));
                return;
            }

            List<Document> multimediaList = post.getList("multimedia", Document.class);

            GetMultimediaResponse.Builder responseBuilder = GetMultimediaResponse.newBuilder();

            if (multimediaList != null && !multimediaList.isEmpty()) {
                for (Document multimediaDoc : multimediaList) {
                    MultimediaItem.Builder itemBuilder = MultimediaItem.newBuilder();

                    if (multimediaDoc.containsKey("filename")) {
                        itemBuilder.setFilename(multimediaDoc.getString("filename"));
                    }
                    if (multimediaDoc.containsKey("original_filename")) {
                        itemBuilder.setOriginalFilename(multimediaDoc.getString("original_filename"));
                    }
                    if (multimediaDoc.containsKey("content_type")) {
                        itemBuilder.setContentType(multimediaDoc.getString("content_type"));
                    }
                    if (multimediaDoc.containsKey("file_url")) {
                        String fileUrl = multimediaDoc.getString("file_url");
                        itemBuilder.setFileUrl(fileUrl);

                        // Leer el archivo y convertirlo a bytes
                        try {
                            File file = new File(fileUrl);
                            if (file.exists() && file.isFile()) {
                                byte[] fileBytes = Files.readAllBytes(file.toPath());
                                itemBuilder.setData(ByteString.copyFrom(fileBytes));
                            } else {
                                System.err.println("File not found: " + fileUrl);
                                // Puedes decidir si quieres enviar un error o simplemente continuar sin los datos
                                // itemBuilder.setData(ByteString.EMPTY);
                            }
                        } catch (IOException e) {
                            System.err.println("Error reading file: " + fileUrl + " - " + e.getMessage());
                        }
                    }
                    if (multimediaDoc.containsKey("uploaded_at")) {
                        itemBuilder.setUploadedAt(multimediaDoc.getString("uploaded_at"));
                    }

                    responseBuilder.addMultimediaItems(itemBuilder.build());
                }
            }

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();

        } catch (IllegalArgumentException e) {
            responseObserver.onError(e);
        } catch (Exception e) {
            System.err.println("Error retrieving multimedia: " + e.getMessage());
            responseObserver.onError(new RuntimeException("Internal server error while retrieving multimedia", e));
        }
    }
}