import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [tickets, setTickets] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3000/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTickets(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/api/tickets",
        {
          title,
          description,
          priority,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Ticket creado correctamente");

      setTitle("");
      setDescription("");
      setPriority("media");
      setShowModal(false);

      fetchTickets();
    } catch (error) {
      console.log(error);
      alert("Error al crear ticket");
    }
  };

    const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>Tickets TI</h2>
        <p>Panel de soporte</p>
        <button className="logout-btn" onClick={handleLogout}>
        Cerrar sesión
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Gestión de tickets de soporte TI</p>
          </div>

          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Nuevo ticket
          </button>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <form className="ticket-form" onSubmit={handleCreateTicket}>
                <h2>Crear nuevo ticket</h2>

                <input
                  type="text"
                  placeholder="Título del ticket"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                  placeholder="Descripción del problema"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>

                <button type="submit" className="btn-primary">
                  Crear ticket
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div
                className="ticket-card"
                key={ticket.id}
                onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}>
              <div className="ticket-card-header">
                <h3>{ticket.title}</h3>

                <span
                  className={`badge status-${ticket.status.replace(" ", "-")}`}
                >
                  {ticket.status}
                </span>
              </div>

              <p className="ticket-description">{ticket.description}</p>

              <div className="ticket-footer">
                <span className={`badge priority-${ticket.priority}`}>
                  {ticket.priority}
                </span>

                <small>Creado por: {ticket.created_by}</small>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;