const express = require("express");
const router = express.Router();

router.get("/studentDataFieldWise", (req, res) => {
  try {
    res.send([global.students, global.studentCategory]);
  } catch (err) {
    console.log(err);
  }
});

router.get("/studentDataAll", (req, res) => {
  try {
    res.send(global.students);
  } catch (err) {
    console.log(err);
  }
});



module.exports = router;