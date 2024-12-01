const express = require("express");
const Reservation = require("../models/reservation");
const User = require("../models/users");
const Service = require("../models/services");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, serviceId, date, time, status } = req.body;

  if (!userId || !serviceId || !date || !time) {
    return res.status(400).json({ message: "Trūksta privalomų laukų." });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({ message: "Neteisingas naudotojo ID formatas." });
  }

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res
      .status(400)
      .json({ message: "Neteisingas paslaugos ID formatas." });
  }

  try {
    console.log("Tikrinama, ar naudotojas egzistuoja...");
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Naudotojas nerastas." });
    }

    console.log("Tikrinama, ar paslauga egzistuoja...");
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Paslauga nerasta." });
    }

    console.log("Tikrinama, ar tokia rezervacija jau egzistuoja...");
    const existingReservation = await Reservation.findOne({
      userId,
      serviceId,
      date,
      time,
    });

    if (existingReservation) {
      return res
        .status(400)
        .json({ message: "Rezervacija jau egzistuoja šiuo laiku." });
    }

    console.log("Kuriama nauja rezervacija...");
    const reservation = new Reservation({
      userId,
      serviceId,
      date,
      time,
      status,
    });
    await reservation.save();

    res.status(201).json(reservation);
  } catch (error) {
    console.error("Klaida kuriant rezervaciją:", error);
    res.status(500).json({ message: "Nepavyko sukurti rezervacijos.", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("userId", "name email phone")
      .populate("serviceId", "name price");
    res.status(200).json(reservations);
  } catch (error) {
    console.error("Klaida gaunant rezervacijas:", error);
    res
      .status(500)
      .json({ message: "Nepavyko gauti rezervacijų.", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id)
      .populate("userId", "name email phone")
      .populate("serviceId", "name price");
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
