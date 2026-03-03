const crypto = require('crypto');
const fs = require('fs');

try {
    //Reading the ALU file
    const fileBuffer = fs.readFileSync('alu-logo.png');
    
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    console.log('SHA-256 Hash Generated!');
    console.log('Hash (with 0x prefix):', '0x' + hash);
    console.log('Hash (without prefix):', hash);
} catch (error) {
    console.error('Error reading logo file:', error.message);
    console.log('Make sure alu-logo.png exists in the project root');
}