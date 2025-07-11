use std::env;
use std::path::PathBuf;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let proto_files = ["proto/sirsi/agent/v1/agent_service.proto"];
    let include_dirs = ["proto"];

    // Configure tonic-build
    tonic_build::configure()
        .build_server(true)
        .build_client(true)
        .file_descriptor_set_path(out_dir.join("agent_descriptor.bin"))
        .compile(&proto_files, &include_dirs)?;

    println!("cargo:rerun-if-changed=proto/");
    Ok(())
}
