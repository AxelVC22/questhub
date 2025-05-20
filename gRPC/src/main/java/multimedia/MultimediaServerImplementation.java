package multimedia;

import com.proto.multimedia.MultimediaServiceGrpc;
import com.proto.multimedia.UploadRequest;
import com.proto.multimedia.UploadResponse;

import dataaccess.MongoConnection;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import org.bson.Document;

import io.grpc.stub.StreamObserver;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class MultimediaServerImplementation extends MultimediaServiceGrpc.MultimediaServiceImplBase {

    private static final String UPLOAD_DIR = "C:/questhub-uploads/posts/";

    @Override
    public StreamObserver<UploadRequest> upload(StreamObserver<UploadResponse> responseObserver) {

        MongoConnection.connect();
        MongoCollection<Document> postsCollection = MongoConnection.getDatabase().getCollection("posts");

        List<Document> multimediaDocs = new ArrayList<>();
        final String[] postIdHolder = new String[1]; // Para almacenar el postId del primer mensaje recibido

        return new StreamObserver<UploadRequest>() {

            @Override
            public void onNext(UploadRequest req) {
                try {
                    // Guarda el postId del primer mensaje (asumimos todos los chunks son del mismo post)
                    if (postIdHolder[0] == null) {
                        postIdHolder[0] = req.getPostId();
                    }

                    // Guarda archivo en disco
                    File uploadDir = new File(UPLOAD_DIR);
                    if (!uploadDir.exists()) uploadDir.mkdirs();

                    String safeFilename = req.getFilename().replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
                    // Para evitar sobreescribir archivos, puedes agregar un timestamp o UUID aquí si quieres
                    File file = new File(uploadDir, safeFilename);

                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        fos.write(req.getData().toByteArray());
                    }

                    String fileUrl = file.getAbsolutePath();

                    // Crear documento multimedia para agregar a post
                    Document multimediaDoc = new Document()
                            .append("filename", req.getFilename())
                            .append("content_type", req.getContentType())
                            .append("file_url", fileUrl);

                    multimediaDocs.add(multimediaDoc);

                } catch (IOException e) {
                    responseObserver.onError(e);
                }
            }

            @Override
            public void onError(Throwable t) {
                System.err.println("Upload cancelled: " + t.getMessage());
            }

            @Override
            public void onCompleted() {
                if (postIdHolder[0] == null || postIdHolder[0].isEmpty()) {
                    responseObserver.onError(new Throwable("postId is missing in request"));
                    return;
                }

                // Actualizar el post con el arreglo multimedia (push a array)
                postsCollection.updateOne(
                        Filters.eq("_id", new org.bson.types.ObjectId(postIdHolder[0])),
                        Updates.pushEach("multimedia", multimediaDocs)
                );

                // Responder con éxito (puedes enviar la URL del último archivo subido, por ejemplo)
                String lastUrl = multimediaDocs.isEmpty() ? "" : multimediaDocs.get(multimediaDocs.size() - 1).getString("file_url");
                responseObserver.onNext(UploadResponse.newBuilder().setUrl(lastUrl).build());
                responseObserver.onCompleted();
            }
        };
    }
}
