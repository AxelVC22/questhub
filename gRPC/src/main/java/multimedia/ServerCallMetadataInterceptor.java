package multimedia;

import io.grpc.*;

public class ServerCallMetadataInterceptor implements ServerInterceptor {

    public static final Context.Key<String> POST_ID_CTX_KEY = Context.key("postId");

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call,
            Metadata headers,
            ServerCallHandler<ReqT, RespT> next) {

        String postId = headers.get(Metadata.Key.of("post-id", Metadata.ASCII_STRING_MARSHALLER));
        Context ctx = Context.current().withValue(POST_ID_CTX_KEY, postId);

        return Contexts.interceptCall(ctx, call, headers, next);
    }
}
