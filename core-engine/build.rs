fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .protoc_arg("--experimental_allow_proto3_optional")
        .build_server(true)
        .build_client(true)
        .compile(
            &[
                "proto/agent.proto",
                // Add more proto files here as needed
            ],
            &["proto"],
        )?;
    Ok(())
}
