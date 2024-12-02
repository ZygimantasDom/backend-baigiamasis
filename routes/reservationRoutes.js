const express = require("express");
const Reservation = require("../models/reservation");
const User = require("../models/users");
const Service = require("../models/services");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/", async (req, res) => {
  const { firstName, lastName, email, phone, service, date, time } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !service ||
    !date ||
    !time
  ) {
    return res.status(400).json({ message: "Trūksta privalomų laukų." });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: `${firstName} ${lastName}`,
        email,
        phone,
      });
      await user.save();
    }

    const serviceDoc = await Service.findOne({ name: service });
    if (!serviceDoc) {
      return res.status(404).json({ message: "Paslauga nerasta." });
    }

    const reservation = new Reservation({
      userId: user._id,
      serviceId: serviceDoc._id,
      date,
      time,
    });
    await reservation.save();

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("userId", "name email phone")
      .populate("serviceId", "name");

    res.status(201).json(populatedReservation);
  } catch (error) {
    console.error("Klaida kuriant rezervaciją:", error);
    res.status(500).json({ message: "Nepavyko sukurti rezervacijos.", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("userId", "name email phone")
      .populate("serviceId", "name");

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Klaida gaunant rezervacijas:", error);
    res.status(500).json({ message: "Nepavyko gauti rezervacijų.", error });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id)
      .populate("userId", "name email phone")
      .populate("serviceId", "name");
    if (!reservation) {
      return res.status(404).json({ message: "Rezervacija nerasta." });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Nepavyko gauti rezervacijos.", error });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { date, time, status } = req.body;

  try {
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { date, time, status },
      { new: true }
    );
    if (!reservation) {
      return res.status(404).json({ message: "Rezervacija nerasta." });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Nepavyko atnaujinti rezervacijos.", error });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
      return res.status(404).json({ message: "Rezervacija nerasta." });
    }
    res.status(200).json({ message: "Rezervacija ištrinta." });
  } catch (error) {
    res.status(500).json({ message: "Nepavyko ištrinti rezervacijos.", error });
  }
});

module.exports = router;
