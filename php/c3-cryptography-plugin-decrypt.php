<?php

// This script attempts to decrypt an urlencoded & base64 encoded string that
// was generated using Construct 3's Cryptography plugin using password-based 
// AES 256 encryption.
// The decrypt_c3_aes_gcm function takes a base64 encoded string as an input.
// The script expects the payload in the "data" GET parameter; since base64
// strings are not URL safe, the payload must be urlencoded as well.

define('PASSWORD', 'hackerman'); // enter the same password you specified in C3

function decrypt_c3_aes_gcm($encrypted_base64, $password) {

    // Base64 decode the input
    $encrypted_data = base64_decode($encrypted_base64);

    if ($encrypted_data === false) {
        return false; // Return false if Base64 decoding fails
    }

    // Extract parts from the binary data based on the format described here:
    // https://www.construct.net/en/make-games/manuals/construct-3/plugin-reference/cryptography#internalH1Link4

    $reserved = ord($encrypted_data[0]);      // Reserved byte (should be 0)
    $salt = substr($encrypted_data, 1, 16);   // Salt (16 bytes)
    $iv = substr($encrypted_data, 17, 12);    // Initialization Vector (12 bytes)
    $iterations = unpack('N', substr($encrypted_data, 29, 4))[1]; // Iterations (4 bytes, uint32)
    $ciphertext = substr($encrypted_data, 33); // Ciphertext starts from byte 33 onwards
    // Validate the reserved byte is zero
    if ($reserved !== 0) {
        return false; // Invalid format (reserved byte is not 0)
    }

    // Derive the encryption key using PBKDF2 with the provided password, salt, and iterations
    $key = hash_pbkdf2('sha256', $password, $salt, $iterations, 32, true); // 256-bit (32-byte) key
    // Separate the encrypted payload and the GCM authentication tag
    $tag = substr($ciphertext, -16); // GCM authentication tag (16 bytes at the end)
    $encrypted_payload = substr($ciphertext, 0, -16); // Encrypted data (without tag)
    // Decrypt the payload
    $decrypted_data = openssl_decrypt(
            $encrypted_payload, // Ciphertext
            'aes-256-gcm', // Cipher method
            $key, // Key derived from password
            OPENSSL_RAW_DATA, // Output raw data
            $iv, // Initialization vector (IV)
            $tag // GCM tag
    );

    // Return the decrypted text if successful, or false if decryption failed
    return $decrypted_data !== false ? $decrypted_data : false;
}

// Get the encrypted data from the "data" GET parameter and urldecode it
$encrypted_data_base64 = urldecode(filter_input(INPUT_GET, 'data'));

// Try to decrypt the data
$decrypted_text = decrypt_c3_aes_gcm($encrypted_data_base64, PASSWORD);

if ($decrypted_text !== false) {
    echo 'Decrypted Text: ' . $decrypted_text;
} else {
    echo 'Decryption failed!';
}
