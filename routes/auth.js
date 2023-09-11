const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');
const { isAuthenticated } = require('../middlewares/jwt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;

router.post("/signup", async (req, res, next) => {
  const { email, username, password } = req.body;
  if (email === "" || password === "" || username === "") {
    res.status(400).json({ message: "Please fill all the fields to register" });
    return;
  }
  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Not a valid email format" });
    return;
  }
  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter",
    });
    return;
  }
  try {
    const userDB = await User.findOne({ email });
    if (userDB) {
      res.status(400).json({ message: "User already exists" });
    } else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const newUser = await User.create({
        email,
        hashedPassword,
        username,
        // image,
      });
      res.status(201).json({ data: newUser });
    }
  } catch (error) {
    console.log(error)
  }
});

router.post("/login", async (req, res, next) => {
  const { usernameOrEmail, password } = req.body;
  const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
    usernameOrEmail
  );
  const key = isEmail ? "email" : "username";
  // Check if email or password are provided as empty string
  if (usernameOrEmail === "" || password === "") {
    res.status(400).json({ message: "Please fill all the fields to login" });
    return;
  }
  try {
    // First let's see if the user exists
    const userInDB = await User.findOne({ [key]: usernameOrEmail });
    // If they don't exist, return an error
    if (!userInDB) {
      res
        .status(404)
        .json({
          success: false,
          message: `No user registered by email ${usernameOrEmail}`,
        });
      return;
    } else {
      const passwordMatches = bcrypt.compareSync(
        password,
        userInDB.hashedPassword
      );
      if (passwordMatches) {
        // Let's create what we want to store in the jwt token
        const payload = {
          email: userInDB.email,
          username: userInDB.username,
          role: userInDB.role,
          _id: userInDB._id,
        };
        // Use the jwt middleware to create de token
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "30d",
        });
        res.status(200).json({ authToken: authToken });
      } else {
        // If the password is not right, return an error
        res
          .status(401)
          .json({ success: false, message: "Unable to authenticate user" });
      }
    }
  } catch (error) {
    next(error);
  }
});

router.get("/me", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log("Whose token is on the request:", req.payload);
  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});

module.exports = router;
