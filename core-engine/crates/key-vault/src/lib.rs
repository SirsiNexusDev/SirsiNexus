// Key Vault Module
//! The Key Vault module provides secure key management and cryptographic operations
//! for the SirsiNexus platform.

#![forbid(unsafe_code)]
#![warn(missing_docs)]

/// Returns the current version of the key-vault service
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version() {
        assert!(!version().is_empty());
    }
}
