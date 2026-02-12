import { useState, useRef, useEffect } from "react";
import "../App.css";
import NoteCard from "./NoteCard";
import api from "../api/axios";
import socket from "../../socket";

export default function BoardCard({
  board,
  isModalOpen,
  setActiveModalBoard,
  updateBoardNotes,
  setBoards,
}) {
  const [newNote, setNewNote] = useState("");
  const [draggedNoteIndex, setDraggedNoteIndex] = useState(null);
  const notesContainerRef = useRef(null);

  const notes = Array.isArray(board?.notes) ? board.notes : [];

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (notesContainerRef.current) {
      notesContainerRef.current.scrollTop =
        notesContainerRef.current.scrollHeight;
    }
  }, [notes, isModalOpen]);

  /* ================= NOTE DRAG & DROP ================= */
  const handleNoteDragStart = (e, index) => {
    e.stopPropagation();
    setDraggedNoteIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleNoteDrop = (e, dropIndex) => {
    e.stopPropagation();
    if (draggedNoteIndex === null || draggedNoteIndex === dropIndex) return;

    const updatedNotes = [...notes];
    const [movedNote] = updatedNotes.splice(draggedNoteIndex, 1);
    updatedNotes.splice(dropIndex, 0, movedNote);

    updateBoardNotes(board._id, updatedNotes);
    setDraggedNoteIndex(null);
  };

  /* ================= ACTIONS ================= */
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const content = newNote;
    setNewNote("");
    setActiveModalBoard(null);
    try {
      await api.post(`/boards/${board._id}/notes`, { content }, { withCredentials: true });
    } catch (err) {
      console.error("Failed to add note");
    }
  };

  const handleDeleteBoard = async () => {
    
    try {
      setBoards((prev) => prev.filter((b) => b._id !== board._id));
      await api.delete(`/boards/${board._id}`, { withCredentials: true });
    } catch (err) {
      console.error("Failed to delete board");
    }
  };

  /* ================= SOCKETS ================= */
  useEffect(() => {
    const handleNoteAdded = ({ boardId, note }) => {
      setBoards((prevBoards) =>
        prevBoards.map((b) => {
          if (b._id !== boardId) return b;
          if (b.notes.some((n) => n._id === note._id)) return b;
          return { ...b, notes: [...b.notes, note] };
        })
      );
    };
    socket.on("note-added", handleNoteAdded);
    return () => socket.off("note-added", handleNoteAdded);
  }, [setBoards]);

  useEffect(() => {
    const handleNoteDeleted = ({ boardId, noteId }) => {
      setBoards((prevBoards) =>
        prevBoards.map((b) => (b._id === boardId ? { ...b, notes: b.notes.filter(n => n._id !== noteId) } : b))
      );
    };
    socket.on("note-deleted", handleNoteDeleted);
    return () => socket.off("note-deleted", handleNoteDeleted);
  }, [setBoards]);

  return (
    <div className={`modern-board-card ${isModalOpen ? "active-ring" : ""}`}>
      <div className="board-header">
        <div className="board-title-group">
          <div className="board-dot"></div>
          <h3>{board.title}</h3>
        </div>
        <button className="board-more-btn" onClick={handleDeleteBoard} title="Delete Board">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
        </button>
      </div>

      <div className="board-notes-list" ref={notesContainerRef}>
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <div
              key={note._id}
              draggable
              onDragStart={(e) => handleNoteDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleNoteDrop(e, index)}
              className={`note-draggable-wrapper ${draggedNoteIndex === index ? "is-dragging" : ""}`}
            >
              <NoteCard boardId={board._id} note={note} setBoards={setBoards} />
            </div>
          ))
        ) : !isModalOpen ? (
          <div className="empty-state">
            <p>No notes yet</p>
          </div>
        ) : null}

        {isModalOpen && (
          <div className="modern-inline-modal">
            <textarea
              className="modern-textarea"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What's on your mind?"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
            />
            <div className="modal-actions">
              <button className="btn-text" onClick={() => setActiveModalBoard(null)}>Cancel</button>
              <button className="btn-primary-sm" onClick={handleAddNote}>Add</button>
            </div>
          </div>
        )}
      </div>

      {!isModalOpen && (
        <button className="add-note-trigger" onClick={() => setActiveModalBoard(board._id)}>
          <span className="plus-icon">+</span> Add a note
        </button>
      )}
    </div>
  );
}