fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .protoc_arg("--experimental_allow_proto3_optional")
        .build_server(true)
        .build_client(true)
        .compile(
            &["proto/identity.proto"],
            &["proto"],
        )?;
    Ok(())
}
