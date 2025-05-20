package multimedia;

import com.proto.multimedia.MultimediaServiceGrpc;
import com.proto.multimedia.UploadRequest;
import com.proto.multimedia.UploadResponse;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.stub.StreamObserver;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class MultimediaClient {

    private final MultimediaServiceGrpc.MultimediaServiceStub asyncStub;
    private final String postId;

    public MultimediaClient(ManagedChannel channel, String postId) {
        this.asyncStub = MultimediaServiceGrpc.newStub(channel);
        this.postId = postId;
    }

    public void uploadFile(String filePath) throws InterruptedException, IOException {
        CountDownLatch latch = new CountDownLatch(1);

        StreamObserver<UploadRequest> requestObserver = asyncStub.upload(new StreamObserver<UploadResponse>() {
            @Override
            public void onNext(UploadResponse uploadResponse) {
                System.out.println("URL recibido del servidor: " + uploadResponse.getUrl());
            }

            @Override
            public void onError(Throwable throwable) {
                System.err.println("Error en la subida: " + throwable.getMessage());
                latch.countDown();
            }

            @Override
            public void onCompleted() {
                System.out.println("Subida completada");
                latch.countDown();
            }
        });

        // Leer archivo bytes
        byte[] fileBytes = Files.readAllBytes(Paths.get(filePath));
        String filename = Paths.get(filePath).getFileName().toString();

        // Enviar mensaje con archivo y postId
        UploadRequest request = UploadRequest.newBuilder()
                .setPostId(postId)          // aquí va el postId
                .setFilename(filename)
                .setContentType("image/jpeg") // ajusta si quieres
                .setData(com.google.protobuf.ByteString.copyFrom(fileBytes))
                .build();

        requestObserver.onNext(request);
        requestObserver.onCompleted();

        // Esperar la respuesta
        latch.await(1, TimeUnit.MINUTES);
    }

    public static void main(String[] args) throws InterruptedException, IOException {
        String target = "localhost:50051"; // dirección y puerto del servidor gRPC
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress("localhost", 50051)
                .usePlaintext()
                .maxInboundMessageSize(20 * 1024 * 1024)  // Igual que en el servidor
                .build();


        // Post ID que quieres enviar en cada mensaje
        String postId = "6823cbaf83f7d117224b155e";

        MultimediaClient client = new MultimediaClient(channel, postId);
        client.uploadFile("C:/Users/axel_/OneDrive/Pictures/Álbum de cámara/bi67wjsrcui41.jpg");

        channel.shutdownNow();
    }
}
