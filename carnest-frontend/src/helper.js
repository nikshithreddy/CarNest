export const generateSeatList = (totalSeats) => {
  if (totalSeats < 2) {
    throw new Error("Invalid number of seats. Must be at least 2.");
  }

  const seatList = [];

  // Add the front passenger seat
  if (totalSeats >= 2) seatList.push("Front Right");

  // Logic for middle seats (for vehicles with 5+ seats)
  // In this case, we don't need middle seats for 4 seats
  // ...

  // Logic for back seats (starting with the back left and back right)
  seatList.push("Back Left", "Back Right");

  return seatList.slice(0, totalSeats - 1); // Ensure it matches the exact number of seats
};