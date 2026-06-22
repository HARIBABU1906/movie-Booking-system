import { useState } from "react";

const seats = [
  "A1",
  "A2",
  "A3",
  "A4",
  "B1",
  "B2",
  "B3",
  "B4",
  "C1",
  "C2",
  "C3",
  "C4",
];

export default function Seat() {
  const [selected, setSelected] = useState([]);

  const clickSeat = (seat) => {
    setSelected((current) =>
      current.includes(seat)
        ? current.filter((item) => item !== seat)
        : [...current, seat]
    );
  };

  return (
    <div className="seat-layout">
      {seats.map((seat) => (
        <button
          key={seat}
          type="button"
          className={selected.includes(seat) ? "seat selected" : "seat"}
          onClick={() => clickSeat(seat)}
        >
          {seat}
        </button>
      ))}
    </div>
  );
}
