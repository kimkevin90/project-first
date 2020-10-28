const express = require("express");
const Login = require("../models/Login");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const router = express.Router();
const auth = require("../middleware/auth");

// 1. query는 클라리언트에서 GET 방식으로 전송한 요청 파라미터를 확인
// 2. body는 클라리언트에서 POST 방식으로 전송한 요청 파라미터를 확인
// 3. header 헤더 확인

router.post("/register", async (req, res, next) => {
  try {
    let { email, password, passwordCheck, displayName } = req.body;

    // validate

    if (!email || !password || !passwordCheck)
      return res.status(400).json({ msg: "Not all fields have been entered." });
    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "The password needs to be at least 5 characters long." });
    if (password !== passwordCheck)
      return res
        .status(400)
        .json({ msg: "Enter the same password twice for verification." });

    const existingUser = await Login.findOne({
      where: { email: email },
    });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "An account with this email already exists." });
    if (!displayName) displayName = email;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new Login({
      email,
      password: passwordHash,
      displayName,
    });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate
    if (!email || !password)
      return res.status(400).json({ msg: "Not all fields have been entered." });

    const user = await Login.findOne({ where: { email: email } });
    if (!user)
      return res
        .status(400)
        .json({ msg: "No account with this email has been registered." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    console.log(process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const deletedUser = await Login.destroy({ where: { id: req.user } });
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await Login.findOne({ where: { id: verified.id } });
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// router.get("/getAll", async (req, res, next) => {
//   try {
//     const user = await User.findAll();
//     res.status(201).json(user);
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });

// router.patch("/update", async (req, res, next) => {
//   try {
//     const results = await User.update(
//       {
//         name: req.body.name,
//         contents: req.body.contents,
//         writer: req.body.writer,
//         date: req.body.date,
//       },
//       { where: { id: req.body.id } }
//     );
//     res.json({ success: results });
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });

// // :id 이 방식으로 해당 열의 id 값을 가져오고 sequalize 조건절에 삽입
// router.delete("/delete/:id", async (req, res, next) => {
//   try {
//     const result = await User.destroy({ where: { id: req.params.id } });
//     res.json({ success: result });
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });

// router.get("/search/:name", async (req, res, next) => {
//   try {
//     const result = await User.findAll({
//       where: {
//         [Op.or]: [
//           { contents: req.params.name },
//           { name: req.params.name },
//           { writer: req.params.name },
//         ],
//       },
//     });
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
// });
module.exports = router;
