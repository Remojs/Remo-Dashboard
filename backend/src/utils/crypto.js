const CryptoJS = require('crypto-js');

const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long.');
  }
  return key;
};

/**
 * Encrypts a plain-text string using AES-256.
 * @param {string} plainText
 * @returns {string} Base64-encoded cipher text
 */
const encrypt = (plainText) => {
  if (!plainText) throw new Error('encrypt() requires a non-empty string.');
  const cipherText = CryptoJS.AES.encrypt(plainText, getKey()).toString();
  return cipherText;
};

/**
 * Decrypts an AES-encrypted string.
 * @param {string} cipherText
 * @returns {string} Plain-text string
 */
const decrypt = (cipherText) => {
  if (!cipherText) throw new Error('decrypt() requires a non-empty string.');
  const bytes = CryptoJS.AES.decrypt(cipherText, getKey());
  const plainText = bytes.toString(CryptoJS.enc.Utf8);
  if (!plainText) throw new Error('Decryption failed — invalid cipher text or key.');
  return plainText;
};

module.exports = { encrypt, decrypt };
