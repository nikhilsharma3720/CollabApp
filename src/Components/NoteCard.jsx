import { useState } from "react";
import api from "../api/axios";
import "./Navbar.css";

export default function NoteCard({ boardId, note, onEdit, setBoards }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    if (!content.trim()) return;
    onEdit(note._id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      setBoards((prevBoards) =>
        prevBoards.map((board) =>
          board._id === boardId
            ? { ...board, notes: board.notes.filter((n) => n._id !== note._id) }
            : board,
        ),
      );

      await api.delete(`/boards/${boardId}/notes/${note._id}`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <div className={`note-card-v2 ${isEditing ? "editing" : ""}`}>
      {!isEditing ? (
        <>
          <div className="note-body">
            <p className="note-text">{note.content}</p>
          </div>

          <div className="note-footer">
            <span className="note-author">
              {note.user?.name?.charAt(0) || "U"}
            </span>
            <div className="note-actions">
              <button
                className="icon-btn edit"
                onClick={() => setIsEditing(true)}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="icon-btn delete"
                onClick={handleDelete}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="edit-note-container">
          <textarea
            className="note-edit-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            autoFocus
          />
          <div className="note-edit-actions">
            <button
              onClick={() => setIsEditing(false)}
              className="note-btn-cancel"
            >
              Cancel
            </button>
            <button onClick={handleSave} className="note-btn-save">
              Save Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
