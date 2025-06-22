const crypto = require('crypto');

function generateClassCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateResetToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

module.exports = {
    generateClassCode,
    generateResetToken
};