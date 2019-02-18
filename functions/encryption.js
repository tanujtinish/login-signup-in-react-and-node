'use strict';

const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  
}

function decrypt(text) {
  
}

module.exports = { decrypt, encrypt };