const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Nepavyko gauti vartotojų.", details: error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ error: "Neteisingas vartotojo ID formatas." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Vartotojas nerastas." });

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Nepavyko grąžinti vartotojo.", details: error });
  }
});

router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Nepavyko sukurti vartotojo.", details: error });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ error: "Neteisingas vartotojo ID formatas." });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).json({ error: "Vartotojas nerastas." });

    res.status(200).json(user);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Nepavyko atnaujinti vartotojo.", details: error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ error: "Neteisingas vartotojo ID formatas." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "Vartotojas nerastas" });

    res.status(200).json({ message: "Vartotojas ištrintas." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Nepavyko ištrinti vartotojo.", details: error });
  }
});

module.exports = router;
