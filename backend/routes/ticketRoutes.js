const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTechnician,
  addComment,
  getCommentsByTicket,
} = require("../controllers/ticketController");

router.post("/", verifyToken, createTicket);

router.get("/", verifyToken, getTickets);

router.get("/:id", verifyToken, getTicketById);

router.get("/:id/comments", verifyToken, getCommentsByTicket);

router.put(
  "/:id/status",
  verifyToken,
  authorizeRoles("admin", "tecnico"),
  updateTicketStatus
);

router.put(
  "/:id/assign",
  verifyToken,
  authorizeRoles("admin"),
  assignTechnician
);

router.post("/:id/comments", verifyToken, addComment);

module.exports = router;