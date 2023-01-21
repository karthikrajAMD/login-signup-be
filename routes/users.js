var express = require("express");
var router = express.Router();
var randomstring = require("randomstring");
const { default: mongoose } = require("mongoose");
const { dbUrl } = require("../config/dbConfig");
const { userModel } = require("../Schema/UserSchema");
const { nodemailerService } = require("../config/nodemailerService");
const jwt = require("jsonwebtoken");
const {
  hashedPassword,
  hashCompare,
  createToken,
  validate,
} = require("../config/auth");
// const keysecret =  "my password secret is order management project my batch number is b35we";
mongoose.set("strictQuery", false);
/* GET users listing. */
mongoose.connect(dbUrl);
router.get("/verify", validate, async (req, res) => {
  try {
    let users = await userModel.find();
    res.send({ statusCode: 200, users });
  } catch (err) {
    res.send({ statusCode: 500, message: "Internal server in error" });
  }
});
router.post("/signup", async (req, res) => {
  try {
    if (req.body.password === req.body.cpassword) {
      console.log(req.body);
      let userExist = await userModel.findOne({ email: req.body.email });
      if (!userExist) {
        let newHashedPassword = await hashedPassword(req.body.password);
        req.body.password = newHashedPassword;
        req.body.cpassword = newHashedPassword;
        let newUser = await userModel.create(req.body);
        res.send({ statusCode: 200, message: "signup done successfully" });
      } else {
        res.send({ statusCode: 400, message: "User already Exist" });
      }
    } else {
      res.send({ statusCode: 400, message: "Password doesn't match" });
    }
  } catch (err) {
    console.log(err);
    res.send({ statusCode: 500, message: "Internal server error" });
  }
});
router.post("/login", async (req, res) => {
  try {
    let userExist = await userModel.findOne({ email: req.body.email });
    console.log(userExist);
    if (userExist) {
      if (await hashCompare(req.body.password, userExist.password)) {
        let token = await createToken(userExist);
        res.send({ statusCode: 200, message: "login successful", token });
      } else {
        res.send({ statusCode: 400, message: "Password is wrong" });
      }
    } else {
      res.send({ statusCode: 400, message: "Invalid user credential" });
    }
  } catch (error) {
    console.log(error);
  }
});
router.post("/sendrandomstring", async (req, res) => {
  console.log(req.body);
  const { email } = req.body;
  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }
  try {
    const userfind = await userModel.findOne({ email: email });
    console.log(userfind);
    const random = randomstring.generate(7);
    if (userfind) {
      const update = await userModel.findByIdAndUpdate(
        { _id: userfind._id },
        {
          randomstring: random,
          forgot: "Y",
        }
      );
      const sendLink = await nodemailerService(userfind.email, `${random}`);
      res.status(200).json({
        status: 200,
        message: `OTP sent to your mail ${userfind.email}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ status: 401, message: "invalid user" });
  }
});
router.post("/passwordreset", async (req, res) => {
  console.log(req.body);
  const { email, password, otp } = req.body;
  if (!otp || !password || !email) {
    res.status(401).json({ status: 401, message: "Enter all details" });
  }
  try {
    const userfind = await userModel.findOne({ email: email });
    if (email === userfind.email && otp === userfind.randomstring) {
      if (userfind.forgot === "Y") {
        let newHashedPassword = await hashedPassword(req.body.password);
        const update = await userModel.findByIdAndUpdate(
          { _id: userfind._id },
          {
            password: newHashedPassword,
            cpassword: newHashedPassword,
            randomstring: null,
            forgot: "N",
          }
        );
        res.send({
          status: 200,
          message: `Password reset successful`,
        });
      } else {
        res.send({
          status: 404,
          message: "failed to change password",
        });
      }
    } else {
      res.send({
        status: 404,
        message: `Invalid OTP`,
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: 401, message: "invalid user" });
  }
});
// router.post("/sendpasswordlink", async (req, res) => {
//   console.log(req.body);
//   const { email } = req.body;

//   if (!email) {
//     res.status(401).json({ status: 401, message: "Enter Your Email" });
//   }

//   try {
//     const userfind = await userModel.findOne({ email: email });
//     console.log("userfind._id ", userfind._id);
//     // token generate for reset password
//     const token = await jwt.sign({ _id: userfind._id }, keysecret, {
//       expiresIn: "5m",
//     });
//     console.log("token ", token);

//     const setusertoken = await userModel.findByIdAndUpdate(
//       { _id: userfind._id },
//       { verifytoken: token },
//       { new: true }
//     );

//     if (setusertoken) {
//       const sendLink = await nodemailerService(
//         userfind.email,
//         `https://raja-ordermanagement.netlify.app/users/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`
//       );
//       res.send({
//         statusCode: 200,
//         message: `Reset password link sent to ${userfind.email}`,
//       });
//     }
//   } catch (error) {
//     res.status(401).json({ status: 401, message: "invalid user" });
//   }
// });
// // verify user for forgot password time
// router.get("/forgotpassword/:id/:token", async (req, res) => {
//   const { id, token } = req.params;
//   console.log(id);
//   console.log(token);
//   try {
//     const validUser = await userModel.findById({ _id: id, verifytoken: token });
//     const verifyToken = jwt.verify(token, keysecret);
//     if (validUser && verifyToken._id) {
//       res.status(200).json({ status: 200, message: "user Verified" });
//     } else {
//       res.status(401).json({ status: 401, message: "user not exist" });
//     }
//   } catch (error) {
//     res.status(401).json({ status: 401, error });
//   }
// });

// // change password

// router.post("/:id/:token", async (req, res) => {
//   const { id, token } = req.params;

//   const { password } = req.body;

//   try {
//     const validuser = await userModel.findOne({ _id: id, verifytoken: token });

//     const verifyToken = jwt.verify(token, keysecret);

//     if (validuser && verifyToken._id) {
//       const newpassword = await hashedPassword(password);

//       const setnewuserpass = await userModel.findByIdAndUpdate(
//         { _id: id },
//         { password: newpassword }
//       );

//       setnewuserpass.save();
//       res.send({ statusCode: 200, message: "Password changed successfully" });
//     } else {
//       res.status(401).json({ status: 401, message: "user not exist" });
//     }
//   } catch (error) {
//     res.status(401).json({ status: 401, error });
//   }
// });

module.exports = router;
