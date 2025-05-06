import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto.createHash('sha256').update(String(process.env.CRYPTO_KEY)).digest();

export function encrypt(text: string): string {
    if (typeof text !== 'string') throw new Error('Input must be a string');
    
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Validate output
        if (iv.length !== 16) throw new Error('IV generation failed');
        if (encrypted.length === 0 || encrypted.length % 2 !== 0) {
            throw new Error('Generated ciphertext has odd length');
        }
        
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error:any) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
}

export function decrypt(encrypted: string): string {
    try {
        // Enhanced validation
        if (typeof encrypted !== 'string') {
            throw new Error('Input must be a string');
        }
        
        encrypted = encrypted.trim();
        if (encrypted.length === 0) {
            throw new Error('Input string is empty');
        }

        // Debug logging
        console.debug('Input to decrypt:', encrypted);
        console.debug('Input length:', encrypted.length);

        // Handle both formats (with and without IV separator)
        if (encrypted.includes(':')) {
            // New format with IV
            const parts = encrypted.split(':');
            if (parts.length !== 2) {
                throw new Error('Expected format IV_HEX:CIPHERTEXT_HEX');
            }

            const [ivHex, ciphertext] = parts.map(part => part.trim());

            // Validate IV (32 hex chars = 16 bytes)
            if (!ivHex || !/^[0-9a-fA-F]{32}$/.test(ivHex)) {
                throw new Error(`Invalid IV format: ${ivHex}`);
            }

            // Validate ciphertext
            if (!ciphertext) {
                throw new Error('Ciphertext is empty');
            }
            if (ciphertext.length % 2 !== 0) {
                throw new Error(`Ciphertext has odd length (${ciphertext.length} chars): ${ciphertext}`);
            }

            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            
            let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } else {
            // Old format without IV
            console.warn('Deprecation Warning: Decrypting old format without IV');
            
            if (encrypted.length % 2 !== 0) {
                throw new Error(`Ciphertext has odd length (${encrypted.length} chars): ${encrypted}`);
            }

            const iv = Buffer.alloc(16, 0); // Default IV
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        }
    } catch (error:any) {
        console.error('Decryption error details:', error);
        throw new Error(`Decryption failed: ${error.message}`);
    }
}


export function hashEmail(email: string): string {
  const secretKey = process.env.SECRET_KEY || 'default-key';
  return crypto
    .createHmac('sha256', secretKey)
    .update(email.toLowerCase().trim())
    .digest('hex');
}
