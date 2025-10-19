const Transporter = require("./mailService.js");

const senderMail = process.env.SENDER_MAIL_ID;
async function vehicleCreationEmail({ to, subject, templateData }) {
  await Transporter.transporter.sendMail({
    from: { name: "BIKE RIDER", address: senderMail },
    to,
    subject,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Vehicle Added - SmarTE Desk</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f4f6fb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 40px auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
      padding: 32px 28px;
    }
    h2 {
      color: #2c3e50;
      margin-bottom: 12px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 18px;
    }
    .details {
      background: #f0f4fa;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 18px;
    }
    .details li {
      font-size: 15px;
      color: #34495e;
      margin-bottom: 8px;
      font-weight: 500;
      list-style: none;
    }
    .footer {
      font-size: 13px;
      color: #888;
      margin-top: 30px;
      text-align: center;
    }
    .support {
      color: #2980b9;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Welcome to SmarTE Desk!</h2>
    <p class="greeting">Hello <b>${templateData.userName}</b>,</p>
    <p>We are excited to inform you that your vehicle has been successfully added to our platform. Here are the details:</p>
    <ul class="details">
      <li><b>Vehicle Name:</b> ${templateData.vehicleName}</li>
      <li><b>Vehicle Number:</b> ${templateData.vehicleNumber}</li>
      <li><b>Created Date:</b> ${templateData.created}</li>
      <li><b>Price:</b> ₹${templateData.price}</li>
      <li><b>Vehicle ID:</b> ${templateData.vehicleId}</li>
    </ul>
    <p>If you have any questions or need assistance, feel free to contact our support team at <span class="support">${senderMail}</span>.</p>
    <p>Thank you for choosing SmarTE Desk!</p>
    <div class="footer">
      Regards,<br>
      <b>Team SmarTE Desk</b>
    </div>
  </div>
</body>
</html>
`,
  });
}

async function vehicleUpdateEmail({ to, subject, templateData }) {
  await Transporter.transporter.sendMail({
    from: { name: "BIKE RIDER", address: senderMail },
    to,
    subject,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vehicle Updated - SmarTE Desk</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f4f6fb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 40px auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
      padding: 32px 28px;
    }
    h2 {
      color: #2c3e50;
      margin-bottom: 12px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 18px;
    }
    .details {
      background: #f0f4fa;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 18px;
    }
    .details li {
      font-size: 15px;
      color: #34495e;
      margin-bottom: 8px;
      font-weight: 500;
      list-style: none;
    }
    .footer {
      font-size: 13px;
      color: #888;
      margin-top: 30px;
      text-align: center;
    }
    .support {
      color: #2980b9;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Vehicle Details Updated!</h2>
    <p class="greeting">Hello <b>${templateData.userName}</b>,</p>
    <p>Your vehicle information has been updated on SmarTE Desk. Here are the latest details:</p>
    <ul class="details">
      <li><b>Vehicle Name:</b> ${templateData.vehicleName}</li>
      <li><b>Vehicle Number:</b> ${templateData.vehicleNumber}</li>
      <li><b>Updated Date:</b> ${templateData.updated}</li>
      <li><b>Price:</b> ₹${templateData.price}</li>
      <li><b>Vehicle ID:</b> ${templateData.vehicleId}</li>
    </ul>
    <p>If you have any questions or need assistance, feel free to contact our support team at <span class="support">${senderMail}</span>.</p>
    <p>Thank you for using SmarTE Desk!</p>
    <div class="footer">
      Regards,<br>
      <b>Team SmarTE Desk</b>
    </div>
  </div>
</body>
</html>
`,
  });
}

async function vehicleDeleteEmail({ to, subject, templateData }) {
  await Transporter.transporter.sendMail({
    from: { name: "BIKE RIDER", address: senderMail },
    to,
    subject,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vehicle Deleted - SmarTE Desk</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f4f6fb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 40px auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
      padding: 32px 28px;
    }
    h2 {
      color: #c0392b;
      margin-bottom: 12px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 18px;
    }
    .details {
      background: #f0f4fa;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 18px;
    }
    .details li {
      font-size: 15px;
      color: #34495e;
      margin-bottom: 8px;
      font-weight: 500;
      list-style: none;
    }
    .footer {
      font-size: 13px;
      color: #888;
      margin-top: 30px;
      text-align: center;
    }
    .support {
      color: #2980b9;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Vehicle Deleted</h2>
    <p class="greeting">Hello <b>${templateData.userName}</b>,</p>
    <p>We want to inform you that the following vehicle has been deleted from your account on SmarTE Desk:</p>
    <ul class="details">
      <li><b>Vehicle Name:</b> ${templateData.vehicleName}</li>
      <li><b>Vehicle Number:</b> ${templateData.vehicleNumber}</li>
      <li><b>Deleted Date:</b> ${templateData.updated}</li>
      <li><b>Price:</b> ₹${templateData.price}</li>
      <li><b>Vehicle ID:</b> ${templateData.vehicleId}</li>
    </ul>
    <p>If you did not request this deletion or have any questions, please contact our support team at <span class="support">${senderMail}</span> immediately.</p>
    <div class="footer">
      Regards,<br>
      <b>Team SmarTE Desk</b>
    </div>
  </div>
</body>
</html>
`,
  });
}

async function userCreationEmail({ to, subject, templateData }) {
  // ...existing code...
  await Transporter.transporter.sendMail({
    from: { name: "BIKE RIDER", address: senderMail },
    to,
    subject,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Bike Rider</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f4f6fb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 40px auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
      padding: 32px 28px;
    }
    h2 {
      color: #2c3e50;
      margin-bottom: 12px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 18px;
    }
    .details {
      background: #f0f4fa;
      border-radius: 6px;
      padding: 5px 10px;
      margin-bottom: 18px;
    }
    .details li {
      font-size: 15px;
      color: #34495e;
      margin-bottom: 8px;
      font-weight: 500;
      list-style: none;
      white-space: nowrap;
    }
    .footer {
      font-size: 13px;
      color: #888;
      margin-top: 30px;
      text-align: center;
    }
    .support {
      color: #2980b9;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Welcome to Bike Rider!</h2>
    <p class="greeting">Hello <b>${templateData.name}</b>,</p>
    <p>Your account has been successfully created. Here are your login details:</p>
    <ul class="details">
      <li><b>Email:</b> ${templateData.email}</li>
      <li><b>Password:</b> ${templateData.password}</li>
    </ul>
    <p>If you have any questions or need assistance, feel free to contact our support team at <span class="support">${senderMail}</span>.</p>
    <div class="footer">
      Regards,<br>
      <b>Team Bike Rider</b>
    </div>
  </div>
</body>
</html>
`,
  });
}

async function userPasswordChangeEmail({ to, subject, templateData }) {
  // ...existing code...
  await Transporter.transporter.sendMail({
    from: { name: "BIKE RIDER", address: senderMail },
    to,
    subject,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed - Bike Rider</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f4f6fb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 40px auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
      padding: 32px 28px;
    }
    h2 {
      color: #2c3e50;
      margin-bottom: 12px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 18px;
    }
    .details {
      background: #f0f4fa;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 18px;
    }
    .details li {
      font-size: 15px;
      color: #34495e;
      margin-bottom: 8px;
      font-weight: 500;
      list-style: none;
    }
    .footer {
      font-size: 13px;
      color: #888;
      margin-top: 30px;
      text-align: center;
    }
    .support {
      color: #2980b9;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Changed Successfully</h2>
    <p class="greeting">Hello <b>${templateData.name}</b>,</p>
    <p>Your password for Bike Rider has been changed successfully.</p>
    <ul class="details">
      <li><b>Email:</b> ${templateData.email}</li>
      <li><b>New Password:</b> ${templateData.password}</li>
    </ul>
    <p>If you did not request this change or have any concerns, please contact our support team immediately at <span class="support">${senderMail}</span>.</p>
    <div class="footer">
      Regards,<br>
      <b>Team Bike Rider</b>
    </div>
  </div>
</body>
</html>
`,
  });
}

async function userContactUsFormEmail({ to, subject, templateData }) {
  await Transporter.transporter.sendMail({
    from: { name: "BIKE RIDER", address: senderMail },
    to: senderMail,
    to,
    subject,

    html: `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>New Contact Us Query</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 20px;
        border: 1px solid #e5e7eb;
      }
      .header {
        background: #2563eb;
        color: white;
        padding: 15px;
        text-align: center;
        border-radius: 12px 12px 0 0;
      }
      .content {
        margin: 20px 0;
        color: #374151;
        line-height: 1.6;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #6b7280;
        text-align: center;
      }
      .highlight {
        font-weight: bold;
        color: #111827;
      }
      .box {
        background: #f3f4f6;
        padding: 15px;
        border-radius: 8px;
        margin-top: 10px;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>📩 New Contact Us Query</h2>
      </div>
      <div class="content">
        <p>Hello Admin,</p>
        <p>You have received a new query through the <strong>Contact Us</strong> form:</p>

        <div class="box">
          <p><span class="highlight">Name:</span> ${templateData.name}</p>
          <p><span class="highlight">Email:</span> ${templateData.email}</p>
          <p><span class="highlight">Query:</span> ${templateData.message}</p>
       
        </div>

        <p>Please respond to the user at <a href="mailto:${templateData.email}">${templateData.email}</a>.</p>
      </div>
      <div class="footer">
        <p>⚡ This is an automated notification from <strong>Bike Rider</strong>. Do not reply directly to this email.</p>
      </div>
    </div>
  </body>
</html>
`,
  });
}
async function userForgotPasswordEmail({ to, subject, templateData }) {
  await Transporter.transporter.sendMail({
    from: { name: "BIKE RIDER", address: senderMail },
    to: senderMail,
    to,
    subject,

    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Hello ${templateData.name || "User"},</h2>
      <p>You requested to reset your password for your Bike Rental account.</p>
      <p>
        Please click the link below to set a new password. This link will expire in 1 hour.
      </p>
      <p>
        <a href="${
          templateData.resetLink
        }" style="background: #136C34; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <br/>
      <p>Thanks,<br/>Bike Rental Team</p>
    </div>
  `,
  });
}

async function userBookingConfirmationEmail({ to, subject, templateData }) {
  await Transporter.transporter.sendMail({
    from: { name: "BIKE RIDER", address: senderMail },
    to,
    subject,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; padding-bottom: 10px;">
        <h1 style="color: #136C34;">🚀 Booking Confirmed!</h1>
        <p style="font-size: 16px; color: #555;">Thank you for booking with <strong>Bike Rider</strong>.</p>
      </div>

      <div style="background: #fff; border-radius: 8px; padding: 20px; margin-top: 15px;">
        <h3 style="color: #136C34;">Booking Details</h3>
        <p><strong>Name:</strong> ${templateData.name || "User"}</p>
        <p><strong>Email:</strong> ${templateData.email}</p>
        <p><strong>Vehicle Name:</strong> ${templateData.vehicleName}</p>
        <p><strong>Model:</strong> ${templateData.vehicleModel}</p>
        <p><strong>Type:</strong> ${templateData.vehicleType}</p>
        <p><strong>Vehicle Number:</strong> ${templateData.vehicleNumber}</p>
        <p><strong>Pickup Location:</strong> ${templateData.location}</p>
        <p><strong>Start Date:</strong> ${new Date(
          templateData.startDate
        ).toDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(
          templateData.endDate
        ).toDateString()}</p>
      </div>

      <div style="text-align: center; margin-top: 25px;">
        <p style="font-size: 15px; color: #333;">
          We’re thrilled to have you on board! Enjoy your ride and ride safe 🏍️
        </p>
        <p style="margin-top: 20px; color: #666;">Need help? Contact our support team anytime.</p>
        <a href="mailto:support@bikerider.com" style="background: #136C34; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          Contact Support
        </a>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
      <footer style="text-align: center; font-size: 13px; color: #999;">
        <p>© ${new Date().getFullYear()} Bike Rider. All rights reserved.</p>
      </footer>
    </div>
    `,
  });
}

async function userBookingStatusUpdateEmail({ to, subject, templateData }) {
  await Transporter.transporter.sendMail({
    from: { name: "BIKE RIDER", address: senderMail },
    to,
    subject,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; padding-bottom: 10px;">
        <h1 style="color: #136C34;">
          ${
            templateData.bookingStatus === "completed"
              ? "🏁 Ride Completed!"
              : templateData.bookingStatus === "cancelled"
              ? "❌ Booking Cancelled"
              : "✅ Booking Confirmed"
          }
        </h1>
        <p style="font-size: 16px; color: #555;">
          ${
            templateData.bookingStatus === "completed"
              ? "We hope you enjoyed your ride with Bike Rider!"
              : templateData.bookingStatus === "cancelled"
              ? "Your booking has been cancelled. We’re sorry to see you go."
              : "Your vehicle booking has been successfully confirmed!"
          }
        </p>
      </div>

      <div style="background: #fff; border-radius: 8px; padding: 20px; margin-top: 15px;">
        <h3 style="color: #136C34;">Booking Details</h3>
        <p><strong>Vehicle Name:</strong> ${templateData.vehicleName}</p>
        <p><strong>Model:</strong> ${templateData.vehicleModel}</p>
        <p><strong>Type:</strong> ${templateData.vehicleType}</p>
        <p><strong>Vehicle Number:</strong> ${templateData.vehicleNumber}</p>
        <p><strong>Pickup Location:</strong> ${templateData.location}</p>
        <p><strong>Start Date:</strong> ${new Date(
          templateData.startDate
        ).toDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(
          templateData.endDate
        ).toDateString()}</p>
        <p><strong>Total Price:</strong> ₹${templateData.totalPrice}</p>
        <p><strong>Status:</strong> <span style="color: ${
          templateData.bookingStatus === "completed"
            ? "#136C34"
            : templateData.bookingStatus === "cancelled"
            ? "red"
            : "#007bff"
        }; font-weight: bold;">${templateData.bookingStatus}</span></p>
      </div>

      <div style="text-align: center; margin-top: 25px;">
        ${
          templateData.bookingStatus === "completed"
            ? `
              <p style="font-size: 15px; color: #333;">
                Thank you for choosing <strong>Bike Rider</strong>! We’d love to hear your experience.
              </p>
              <a href="${
                templateData.feedbackLink || "#"
              }" style="background: #136C34; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                Share Feedback
              </a>
            `
            : templateData.bookingStatus === "cancelled"
            ? `
              <p style="font-size: 15px; color: #333;">
                Your booking was cancelled successfully. If you have any concerns, please contact our support team.
              </p>
              <a href="mailto:support@bikerider.com" style="background: red; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                Contact Support
              </a>
            `
            : `
              <p style="font-size: 15px; color: #333;">
                We’re thrilled to have you on board! Get ready to enjoy your upcoming ride. 🏍️
              </p>
            `
        }
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
      <footer style="text-align: center; font-size: 13px; color: #999;">
        <p>© ${new Date().getFullYear()} Bike Rider. All rights reserved.</p>
      </footer>
    </div>
    `,
  });
}

module.exports = {
  vehicleCreationEmail,
  userCreationEmail,
  userPasswordChangeEmail,
  vehicleUpdateEmail,
  vehicleDeleteEmail,
  userContactUsFormEmail,
  userForgotPasswordEmail,
  userBookingConfirmationEmail,
  userBookingStatusUpdateEmail,
};
