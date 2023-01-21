// "use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
const nodemailerService = async (toAddress, myLink) => {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "karthikraja.a.ece@gmail.com", // generated ethereal user
        pass: "jpexcgagfdqxijic", // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "karthikraja.a.ece@gmail.com", // sender address
      to: `${toAddress}`, // list of receivers
      subject: "Your OTP to Reset", // Subject line
      text: "User Password Reset ", // plain text body
      html: `<b>${myLink}</b>`, // html body
    });
  } catch (error) {
    console.error("error da", error);
  }
};

module.exports = { nodemailerService };
