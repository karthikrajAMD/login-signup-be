const dotenv = require("dotenv");
dotenv.config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendMail = async (toAddress, myLink) => {
  try {
    const msg = {
      to: toAddress, // Change to your recipient
      from: "karthikraja.a.ece@gmail.com", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: `<strong>The link is valid for 2 minutes. ${myLink}</strong>`,
    };
    sgMail.send(msg).then(() => {
      console.log("Email sent");
    });
  } catch (error) {
    console.error("error da", error);
  }
};

module.exports = { sendMail };
