function generateSeatMap(rows = 8, cols = 10) {
  const seats = [];
  for (let row = 0; row < rows; row += 1) {
    const rowLabel = String.fromCharCode(65 + row);
    for (let col = 1; col <= cols; col += 1) {
      seats.push(`${rowLabel}${col}`);
    }
  }
  return seats;
}

module.exports = { generateSeatMap };
