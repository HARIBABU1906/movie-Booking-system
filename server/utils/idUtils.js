/**
 * Utility to generate unique, human-readable booking identifiers
 */

/**
 * Generates a booking code in format: CS-XXXXXX (where X is an alphanumeric character)
 * @returns {string} 
 */
function generateBookingCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "CS-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = { generateBookingCode };
