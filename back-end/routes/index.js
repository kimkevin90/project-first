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
    console.log(req.body);
    // validate

    if (!email || !password || !passwordCheck)
      return res.status(400).json({ msg: "모든 필드 입력해주세요" });
    if (password.length < 5)
      return res.status(400).json({ msg: "패스워드 최소 5자리이상" });
    if (password !== passwordCheck)
      return res.status(400).json({ msg: "패스워드를 다시 확인해주세요" });

    const existingUser = await Login.findOne({
      where: { email: email },
    });
    if (existingUser)
      return res.status(400).json({ msg: "이미 등록한 계정입니다." });
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
      return res.status(400).json({ msg: "모든필드를 입력해주세요" });

    const user = await Login.findOne({ where: { email: email } });
    if (!user) return res.status(400).json({ msg: "없는 계정인데요?" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "비번틀린듯" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    console.log(process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user.id,
        displayName: user.displayName,
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

router.get("/", auth, async (req, res) => {
  const user = await Login.findOne({ where: { id: req.user } });
  res.json({
    displayName: user.displayName,
    id: user.id,
  });
});

module.exports = router;
