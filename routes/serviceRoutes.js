const express = require("express");
const Service = require("../models/services");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error("Klaida gaunant paslaugas:", error);
    res.status(500).json({ message: "Nepavyko gauti paslaugų.", error });
  }
});

module.exports = router;
