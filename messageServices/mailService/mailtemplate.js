function bookingConfirmationTemplate({ userName, vehicleName, bookingDate, price }) {
  return `
    <h2>Booking Confirmation</h2>
    <p>DearRohit,</p>
    <p>Your booking for <strong>werrt#</strong> on <strong>21/08/2025</strong> has been confirmed.</p>
    <p>Total Price: <strong>600</strong></p>
    <br/>
    <p>Thank you for choosing Go Gear!</p>
  `;
}

module.exports = { bookingConfirmationTemplate };