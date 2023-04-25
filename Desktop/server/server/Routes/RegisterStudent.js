const express = require("express");
const router = express.Router();
const Student = require("../models/Students");
const Admin = require("../models/Admin");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = "ThisIsTheAuthenticationSecretString";

// Add A Student From An Admin

router.post(
  "/registerStudent",
  body("Email", "Check Your Email Address").isEmail(),
  // password must be at least 5 chars long
  body("Password", "Minimum Length Should be 8").isLength({ min: 8 }),
  body("RollNumber", "Follow Format YYDEPTROLLNO - XXXXXXXX").isLength({
    min: 8,
  }),

  async (req, res) => {
    let RollNumber = req.body.RollNumber;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(10);
    let secPassword = await bcrypt.hash(req.body.Password, salt);

    try {
      let studentData = await Student.findOne({ RollNumber });
      if (!studentData) {
        await Student.create({
          StudentName: req.body.StudentName,
          RollNumber: req.body.RollNumber,
          Email: req.body.Email,
          Password: secPassword,
          Field: req.body.Field,
          Department: req.body.Department,
          Class: req.body.Class,
          Marks: {
            Physics: req.body.Marks.Physics,
            Chemistry: req.body.Marks.Chemistry,
            Maths: req.body.Marks.Maths,
          },
        });

        res.json({ success: true });
      } else {
        res.status(400).json({
          errors:
            "Student with Same RollNumber Already Exists ! Please Check Student List !",
        });
      }
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  }
);

// Login Student From HomePage

router.post(
  "/loginStudent",
  body("RollNumber", "Follow Format YYDEPTROLLNO - XXXXXXXX").isLength({
    min: 8,
  }),
  // password must be at least 5 chars long
  body("Password", "Minimum Length Should be 8").isLength({ min: 8 }),

  async (req, res) => {
    let RollNumber = req.body.RollNumber;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let studentData = await Student.findOne({ RollNumber });
      if (!studentData) {
        return res.status(400).json({
          errors: "Check Your Roll Number or Student Not Registered ! !",
        });
      }
      const pwdCompare = await bcrypt.compare(
        req.body.Password,
        studentData.Password
      );
      if (!pwdCompare) {
        return res.status(400).json({ errors: "Check Your Password !!" });
      }
      // JWT Token

      // Getting id
      const data = {
        student: {
          id: studentData.id,
        },
      };
      // sending token
      const authToken = jwt.sign(data, jwtSecret);

      res.json({ success: true, authToken: authToken });
    } catch (error) {
      console.log(err);
      res.json({ success: false });
    }
  }
);
// Login Admin From HomePage

router.post(
  "/loginAdmin",

  async (req, res) => {
    let adminEmail = req.body.adminEmail;

    try {
      let adminData = await Admin.findOne({ adminEmail });
      if (!adminData) {
        return res.status(400).json({
          errors: "Check Your Email or Admin Not Registered ! !",
        });
      }

      if (req.body.adminPassword !== adminData.adminPassword) {
        return res.status(400).json({ errors: "Check Your Password !!" });
      }
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  }
);

module.exports = router;
