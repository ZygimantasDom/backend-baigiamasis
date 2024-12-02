const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
mongoose.set("debug", true);

const app = express();

app.use(cors());
dotenv.config();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/reservations", reservationRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Prisijungta prie MongoDB"))
  .catch((error) => console.log("DB klaida:", error));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serveris veikia ant ${port}`);
});
