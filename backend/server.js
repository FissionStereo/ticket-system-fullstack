const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const verifyToken = require("./middlewares/authMiddleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS resultado");
    res.json({
      mensaje: "Conexión a MySQL exitosa",
      resultado: rows[0].resultado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al conectar con MySQL",
      error: error.message,
    });
  }
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    mensaje: "Acceso autorizado",
    usuario: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});