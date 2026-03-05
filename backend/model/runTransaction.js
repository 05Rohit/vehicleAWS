// utils/runTransaction.js
const mongoose = require("mongoose");

module.exports = async function runTransaction(callback) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// What is runTransaction and What Does It Do?
/* In simple words:

runTransaction makes sure that multiple database operations either ALL succeed or ALL fail together.

 This is called ACID transaction support. */

// Why Use runTransaction?
/* When you have multiple related operations that must be consistent, like:
- Deducting money from one bank account
- Adding money to another account
If one operation fails, you don't want the other to succeed, leaving your data in an inconsistent state. runTransaction ensures that either both operations complete successfully or neither does.
This is crucial for maintaining data integrity in applications like banking systems, e-commerce platforms, etc. */

/* Solution: MongoDB Transaction

With a transaction:

If any step fails

MongoDB automatically rolls back everything

Database returns to previous safe state */
