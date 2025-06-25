use axum::{
    body::Body,
    http::{Request, Response},
    middleware::Next,
};
use uuid::Uuid;

/// Middleware that adds a request ID to each request for tracing purposes.
pub async fn request_id(
    mut request: Request<Body>,
    next: Next<Body>,
) -> Response {
    let request_id = Uuid::new_v4().to_string();
    
    // Add request ID to headers
    request.headers_mut().insert(
        "x-request-id",
        request_id.parse().unwrap(),
    );
    
    // Set up request span for tracing
    let span = tracing::span!(
        tracing::Level::INFO,
        "request",
        request_id = %request_id,
        method = %request.method(),
        uri = %request.uri(),
    );
    
    // Execute the rest of the request chain within the span
    let response = {
        let _enter = span.enter();
        next.run(request).await
    };
    
    // Add request ID to response headers
    let mut response = response;
    response.headers_mut().insert(
        "x-request-id",
        request_id.parse().unwrap(),
    );
    
    response
}
