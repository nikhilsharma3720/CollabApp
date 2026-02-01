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

  /* ================= ADD NOTE ================= */

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const content = newNote;
    setNewNote("");
    setActiveModalBoard(null);

    try {
      await api.post(
        `/boards/${board._id}/notes`,
        { content },
        { withCredentials: true },
      );
    } catch (err) {
      alert("Failed to add note");
    }
  };

  /* ================= DELETE BOARD ================= */

  const handleDeleteBoard = async () => {
    try {
      setBoards((prev) => prev.filter((b) => b._id !== board._id));
      await api.delete(`/boards/${board._id}`, { withCredentials: true });
    } catch (err) {
      alert("Failed to delete board");
    }
  };
  useEffect(() => {
    const handleNoteAdded = ({ boardId, note }) => {
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board._id !== boardId) return board;

          const alreadyExists = board.notes.some((n) => n._id === note._id);

          if (alreadyExists) return board;

          return {
            ...board,
            notes: [...board.notes, note],
          };
        }),
      );
    };

    socket.on("note-added", handleNoteAdded);

    return () => {
      socket.off("note-added", handleNoteAdded);
    };
  }, []);

  useEffect(() => {
    const handleNoteDeleted = ({ boardId, noteId }) => {
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board._id !== boardId) return board;

          return {
            ...board,
            notes: board.notes.filter((note) => note._id !== noteId),
          };
        }),
      );
    };

    socket.on("note-deleted", handleNoteDeleted);

    return () => {
      socket.off("note-deleted", handleNoteDeleted);
    };
  }, []);

  return (
    <div className="board-card">
      <div className="board-header">
        <h3>{board.title}</h3>
        <button className="delete-board-btn" onClick={handleDeleteBoard}>
          🗑️
        </button>
      </div>

      <div className="notes-container" ref={notesContainerRef}>
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <div
              key={note._id}
              draggable
              onDragStart={(e) => handleNoteDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleNoteDrop(e, index)}
              className={`note-wrapper ${
                draggedNoteIndex === index ? "dragging-note" : ""
              }`}
            >
              <NoteCard boardId={board._id} note={note} setBoards={setBoards} />
            </div>
          ))
        ) : !isModalOpen ? (
          <div className="empty-notes-placeholder">
            <div className="placeholder-icon">📝</div>
            <p>No notes yet</p>
          </div>
        ) : null}

        {isModalOpen && (
          <div className="inline-modal">
            <textarea
              className="minimal-textarea"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type your note here..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
            />
            <div className="modal-actions-row">
              <button
                className="btn-discard"
                onClick={() => setActiveModalBoard(null)}
              >
                Cancel
              </button>
              <button className="btn-add-primary" onClick={handleAddNote}>
                Add Note
              </button>
            </div>
          </div>
        )}
      </div>

      {!isModalOpen && (
        <button
          className="add-note-btn"
          onClick={() => setActiveModalBoard(board._id)}
        >
          + Add Note
        </button>
      )}
    </div>
  );
}
