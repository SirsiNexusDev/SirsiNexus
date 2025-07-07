use anyhow::{Result, anyhow};
use ring::aead::{Aad, LessSafeKey, Nonce, UnboundKey, AES_256_GCM, NONCE_LEN};
use ring::rand::{SecureRandom, SystemRandom};
use base64::{encode, decode};

/// Encrypt data using AES-256-GCM
pub fn encrypt_data(key: &[u8], data: &[u8]) -> Result<String> {
    if key.len() != 32 {
        return Err(anyhow!("Encryption key must be 32 bytes for AES-256"));
    }

    let unbound_key = UnboundKey::new(&AES_256_GCM, key)
        .map_err(|_| anyhow!("Failed to create encryption key"))?;
    let sealing_key = LessSafeKey::new(unbound_key);

    // Generate a random nonce
    let mut nonce_bytes = [0u8; NONCE_LEN];
    let rng = SystemRandom::new();
    rng.fill(&mut nonce_bytes)
        .map_err(|_| anyhow!("Failed to generate nonce"))?;
    
    let nonce = Nonce::assume_unique_for_key(nonce_bytes);

    // Encrypt the data
    let mut in_out = data.to_vec();
    sealing_key.seal_in_place_append_tag(nonce, Aad::empty(), &mut in_out)
        .map_err(|_| anyhow!("Failed to encrypt data"))?;

    // Combine nonce and ciphertext, then base64 encode
    let mut result = nonce_bytes.to_vec();
    result.extend_from_slice(&in_out);
    
    Ok(encode(&result))
}

/// Decrypt data using AES-256-GCM
pub fn decrypt_data(key: &[u8], encrypted_data: &str) -> Result<Vec<u8>> {
    if key.len() != 32 {
        return Err(anyhow!("Decryption key must be 32 bytes for AES-256"));
    }

    let unbound_key = UnboundKey::new(&AES_256_GCM, key)
        .map_err(|_| anyhow!("Failed to create decryption key"))?;
    let opening_key = LessSafeKey::new(unbound_key);

    // Decode from base64
    let combined = decode(encrypted_data)
        .map_err(|_| anyhow!("Failed to decode base64 data"))?;

    if combined.len() < NONCE_LEN {
        return Err(anyhow!("Invalid encrypted data: too short"));
    }

    // Split nonce and ciphertext
    let (nonce_bytes, ciphertext) = combined.split_at(NONCE_LEN);
    let nonce = Nonce::try_assume_unique_for_key(nonce_bytes)
        .map_err(|_| anyhow!("Invalid nonce"))?;

    // Decrypt the data
    let mut in_out = ciphertext.to_vec();
    let plaintext = opening_key.open_in_place(nonce, Aad::empty(), &mut in_out)
        .map_err(|_| anyhow!("Failed to decrypt data"))?;

    Ok(plaintext.to_vec())
}

/// Generate a random 256-bit encryption key
pub fn generate_encryption_key() -> Result<Vec<u8>> {
    let mut key = [0u8; 32];
    let rng = SystemRandom::new();
    rng.fill(&mut key)
        .map_err(|_| anyhow!("Failed to generate encryption key"))?;
    Ok(key.to_vec())
}

/// Derive an encryption key from a password using PBKDF2
pub fn derive_key_from_password(password: &str, salt: &[u8]) -> Result<Vec<u8>> {
    use ring::pbkdf2;
    use std::num::NonZeroU32;

    const CREDENTIAL_LEN: usize = 32;
    let iterations = NonZeroU32::new(100_000).unwrap();
    
    let mut key = [0u8; CREDENTIAL_LEN];
    pbkdf2::derive(
        pbkdf2::PBKDF2_HMAC_SHA256,
        iterations,
        salt,
        password.as_bytes(),
        &mut key,
    );
    
    Ok(key.to_vec())
}

/// Generate a random salt for key derivation
pub fn generate_salt() -> Result<Vec<u8>> {
    let mut salt = [0u8; 16];
    let rng = SystemRandom::new();
    rng.fill(&mut salt)
        .map_err(|_| anyhow!("Failed to generate salt"))?;
    Ok(salt.to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let key = generate_encryption_key().unwrap();
        let data = b"Hello, world! This is secret data.";
        
        let encrypted = encrypt_data(&key, data).unwrap();
        let decrypted = decrypt_data(&key, &encrypted).unwrap();
        
        assert_eq!(data, &decrypted[..]);
    }

    #[test]
    fn test_different_keys_fail() {
        let key1 = generate_encryption_key().unwrap();
        let key2 = generate_encryption_key().unwrap();
        let data = b"Secret data";
        
        let encrypted = encrypt_data(&key1, data).unwrap();
        let result = decrypt_data(&key2, &encrypted);
        
        assert!(result.is_err());
    }

    #[test]
    fn test_key_derivation() {
        let password = "test_password_123";
        let salt = generate_salt().unwrap();
        
        let key1 = derive_key_from_password(password, &salt).unwrap();
        let key2 = derive_key_from_password(password, &salt).unwrap();
        
        assert_eq!(key1, key2);
        assert_eq!(key1.len(), 32);
    }

    #[test]
    fn test_different_salts_different_keys() {
        let password = "test_password_123";
        let salt1 = generate_salt().unwrap();
        let salt2 = generate_salt().unwrap();
        
        let key1 = derive_key_from_password(password, &salt1).unwrap();
        let key2 = derive_key_from_password(password, &salt2).unwrap();
        
        assert_ne!(key1, key2);
    }
}
