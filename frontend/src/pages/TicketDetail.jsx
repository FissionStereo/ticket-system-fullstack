import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`http://localhost:3000/api/tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTicket(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTicket();
  }, [id]);

  if (!ticket) {
    return <p>Cargando ticket...</p>;
  }

  return (
  <div className="detail-page">
    <div className="detail-card">
      <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
        Volver
      </button>

      <h1>{ticket.title}</h1>

      <p className="detail-description">{ticket.description}</p>

      <div className="detail-info">
        <span className={`badge status-${ticket.status.replace(" ", "-")}`}>
          {ticket.status}
        </span>

        <span className={`badge priority-${ticket.priority}`}>
          {ticket.priority}
        </span>
      </div>

      <p className="detail-meta">Creado por: {ticket.created_by}</p>
      <p className="detail-meta">
        Técnico: {ticket.technician || "Sin asignar"}
      </p>

      <div className="comments-section">
        <h2>Comentarios</h2>

        {ticket.comments.length === 0 ? (
          <p className="detail-meta">Este ticket aún no tiene comentarios.</p>
        ) : (
          ticket.comments.map((comment) => (
            <div className="comment-card" key={comment.id}>
              <p>{comment.comment}</p>
              <small>
                {comment.usuario} - {comment.rol}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
}

export default TicketDetail;