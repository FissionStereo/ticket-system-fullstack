const pool = require("../config/db");

const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        mensaje: "Título y descripción son obligatorios",
      });
    }

    const userId = req.user.id;

    const [result] = await pool.query(
      "INSERT INTO tickets (title, description, priority, user_id) VALUES (?, ?, ?, ?)",
      [title, description, priority || "media", userId]
    );

    res.status(201).json({
      mensaje: "Ticket creado correctamente",
      ticketId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear ticket",
      error: error.message,
    });
  }
};

const getTickets = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 5 } = req.query;

    const pageNumber = parseInt(page);

    const limitNumber = parseInt(limit);

    const offset = (pageNumber - 1) * limitNumber;

    const validStatus = ["abierto", "en proceso", "cerrado"];

    const validPriority = ["baja", "media", "alta"];

    if (status && !validStatus.includes(status)) {
        return res.status(400).json({
            mensaje: "Estado inválido",
        });
    }

    if (priority && !validPriority.includes(priority)) {
        return res.status(400).json({
            mensaje: "Prioridad inválida",
        });
    }

    let sql = `
      SELECT 
        tickets.id,
        tickets.title,
        tickets.description,
        tickets.status,
        tickets.priority,
        tickets.created_at,
        users.name AS created_by
      FROM tickets
      INNER JOIN users ON tickets.user_id = users.id
      WHERE 1 = 1
    `;

    const params = [];

    if (status) {
      sql += " AND tickets.status = ?";
      params.push(status);
    }

    if (priority) {
      sql += " AND tickets.priority = ?";
      params.push(priority);
    }

    if (search) {
       sql += " AND (tickets.title LIKE ? OR tickets.description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY tickets.created_at DESC LIMIT ? OFFSET ?";
    params.push(limitNumber, offset);

    const [tickets] = await pool.query(sql, params);

    res.json(tickets);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al listar tickets",
      error: error.message,
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await pool.query(
      `SELECT
        tickets.id,
        tickets.title,
        tickets.description,
        tickets.status,
        tickets.priority,
        tickets.created_at,
        users.name AS created_by,
        tech.name AS technician
      FROM tickets
      INNER JOIN users ON tickets.user_id = users.id
      LEFT JOIN users AS tech ON tickets.technician_id = tech.id
      WHERE tickets.id = ?`,
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        mensaje: "Ticket no encontrado",
      });
    }

    const [comments] = await pool.query(
      `SELECT
        comments.id,
        comments.comment,
        comments.created_at,
        users.name AS usuario,
        users.role AS rol
      FROM comments
      INNER JOIN users ON comments.user_id = users.id
      WHERE comments.ticket_id = ?
      ORDER BY comments.created_at ASC`,
      [id]
    );

    res.json({
      ...tickets[0],
      comments,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener ticket",
      error: error.message,
    });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const estadosValidos = [
      "abierto",
      "en proceso",
      "cerrado",
    ];

    if (!estadosValidos.includes(status)) {
      return res.status(400).json({
        mensaje: "Estado inválido",
      });
    }

    const [result] = await pool.query(
      "UPDATE tickets SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Ticket no encontrado",
      });
    }

    res.json({
      mensaje: "Estado del ticket actualizado",
      ticketId: id,
      nuevoEstado: status,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar estado",
      error: error.message,
    });
  }
};

const assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({
        mensaje: "El ID del técnico es obligatorio",
      });
    }

    const [result] = await pool.query(
      "UPDATE tickets SET technician_id = ? WHERE id = ?",
      [technician_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Ticket no encontrado",
      });
    }

    res.json({
      mensaje: "Técnico asignado correctamente",
      ticketId: id,
      technicianId: technician_id,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al asignar técnico",
      error: error.message,
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;

    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        mensaje: "El comentario es obligatorio",
      });
    }

    const userId = req.user.id;

    await pool.query(
      "INSERT INTO comments (ticket_id, user_id, comment) VALUES (?, ?, ?)",
      [id, userId, comment]
    );

    res.status(201).json({
      mensaje: "Comentario agregado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al agregar comentario",
      error: error.message,
    });
  }
};

const getCommentsByTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const [comments] = await pool.query(
      `SELECT 
        comments.id,
        comments.comment,
        comments.created_at,
        users.name AS usuario,
        users.role AS rol
      FROM comments
      INNER JOIN users ON comments.user_id = users.id
      WHERE comments.ticket_id = ?
      ORDER BY comments.created_at ASC`,
      [id]
    );

    res.status(200).json({
      mensaje: "Comentarios obtenidos correctamente",
      comments,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener comentarios",
      error: error.message,
    });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTechnician,
  addComment,
  getCommentsByTicket,
};