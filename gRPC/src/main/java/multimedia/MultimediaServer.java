package multimedia;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import java.io.IOException;

public class MultimediaServer {
    public static void main(String[] args) throws InterruptedException, IOException {
        int port = 50051;

        Server server = ServerBuilder
                .forPort(port)
                .addService(new MultimediaServerImplementation())
                .intercept(new ServerCallMetadataInterceptor())
                .maxInboundMessageSize(20 * 1024 * 1024) // 20 MB
                .build();


        server.start();
        System.out.println("Servidor iniciado..");
        System.out.println("Escuchando en puerto " + port);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Recibiendo solicitud de apagado");
            server.shutdown();
            System.out.println("Servidor detenido");
        }));

        server.awaitTermination();
    }
}
