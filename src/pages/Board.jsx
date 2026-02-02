import React, { useState, useEffect, useCallback } from "react";
import BoardCard from "../Components/BoardCard";
import { useSelector } from "react-redux";
import api from "../api/axios";
import socket from "../../socket";
import toast from "react-hot-toast";
import "../App.css";

export default function Board() {
  const [boards, setBoards] = useState([]);
  const [activeModalBoard, setActiveModalBoard] = useState(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  const [draggedBoardIndex, setDraggedBoardIndex] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const teamId = localStorage.getItem("teamId");
  const teamName = localStorage.getItem("teamName") || "My Workspace";
  const teamJoinCode = localStorage.getItem("teamJoinCode");
  const user = useSelector((state) => state.user);

  /* ================= FETCH BOARDS ================= */
  const fetchBoardsByTeam = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const res = await api.get(`/boards/fetchByTeamId/${teamId}`, {
        withCredentials: true,
      });
      // Extract array correctly based on your backend response structure
      const boardData = Array.isArray(res.data)
        ? res.data
        : res.data.boards || [];
      setBoards(boardData);
    } catch (err) {
      console.error("Failed to fetch boards:", err);
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchBoardsByTeam();
  }, [fetchBoardsByTeam]);

  /* ================= CONSOLIDATED SOCKET.IO LOGIC ================= */
  useEffect(() => {
    if (!teamId || !user?.id) return;

    const roomName = `team:${teamId}`;

    // Join room with full user data
    socket.emit("joinTeam", {
      teamId: roomName,
      user: { _id: user.id, name: user.name, email: user.email },
    });

    // Handle board creation from others
    socket.on("board-created", (newBoard) => {
      setBoards((prev) => {
        if (prev.some((b) => b._id === newBoard._id)) return prev;
        if (newBoard.createdBy?._id !== user.id) {
          toast.success(
            `${newBoard.createdBy?.name || "Teammate"} created a board`,
            { icon: "🚀" },
          );
        }
        return [...prev, newBoard];
      });
    });

    // Handle board deletion
    socket.on("board-deleted", ({ boardId, deletedBy }) => {
      if (deletedBy?.email !== user.email) {
        toast.error(`${deletedBy?.name || "Teammate"} deleted a board`);
      }
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
      setActiveModalBoard((prev) => (prev === boardId ? null : prev));
    });

    // Handle new notes
    socket.on("note-added", ({ boardId, note }) => {
      if (note.user?.email !== user.email) {
        toast(`${note.user?.name || "Teammate"} added a note`, { icon: "📝" });
      }
      setBoards((prev) =>
        prev.map((b) =>
          b._id === boardId
            ? {
                ...b,
                notes: [...b.notes.filter((n) => n._id !== note._id), note],
              }
            : b,
        ),
      );
    });

    // Handle online user count
    socket.on("team-users-count", (data) => {
      const count = Array.isArray(data) ? data.length : data;
      setOnlineUsers(count);
    });

    // Cleanup listeners on unmount or dependency change
    return () => {
      socket.off("board-created");
      socket.off("board-deleted");
      socket.off("note-added");
      socket.off("note-deleted");
      socket.off("team-users-count");
    };
  }, [teamId, user]);

  /* ================= HANDLERS ================= */
  const handleAddBoard = async () => {
    if (!newBoardTitle.trim() || isCreating) return;
    setIsCreating(true);
    try {
      // Just make the API call.
      // The socket listener "board-created" below will handle adding it to the UI.
      await api.post(
        "/boards",
        { title: newBoardTitle, teamId },
        { withCredentials: true },
      );

      setNewBoardTitle("");
      toast.success("Board created!");
    } catch (err) {
      toast.error("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    if (!teamJoinCode) return;
    navigator.clipboard.writeText(teamJoinCode);
    toast.success("Invite code copied!");
  };

  const updateBoardNotes = (boardId, newNotes) => {
    setBoards((prev) =>
      prev.map((b) => (b._id === boardId ? { ...b, notes: newNotes } : b)),
    );
  };

  /* ================= DRAG & DROP ================= */
  const handleBoardDragStart = (e, index) => setDraggedBoardIndex(index);
  const handleBoardDrop = (dropIndex) => {
    if (draggedBoardIndex === null || draggedBoardIndex === dropIndex) return;
    const reordered = [...boards];
    const [moved] = reordered.splice(draggedBoardIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setBoards(reordered);
    setDraggedBoardIndex(null);
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-text">
          <div className="title-row">
            <h2>{teamName}</h2>
            <div className="online-pill">
              <span className="pulse-dot"></span>
              {onlineUsers} online
            </div>
          </div>

          <p className="welcome-sub">
            Welcome back, <strong>{user?.name || "User"}</strong>.
          </p>

          {teamJoinCode && (
            <div className="team-info-row">
              <span className="join-code-badge">
                Invite Code: <code>{teamJoinCode}</code>
              </span>
              <button className="copy-btn" onClick={copyToClipboard}>
                Copy
              </button>
            </div>
          )}
        </div>

        <div className="add-board-controls">
          <input
            type="text"
            placeholder="Board Title (e.g. Q1 Marketing)"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddBoard()}
            className="new-board-input"
          />
          <button
            onClick={handleAddBoard}
            className="new-board-btn"
            disabled={isCreating}
          >
            {isCreating ? "..." : "Create Board"}
          </button>
        </div>
      </header>

      <main className="board-container">
        {loading ? (
          <div className="status-message">Loading workspace...</div>
        ) : boards.length > 0 ? (
          boards.map((board, index) => (
            <div
              key={board._id}
              draggable
              onDragStart={(e) => handleBoardDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleBoardDrop(index)}
              className={`board-wrapper ${draggedBoardIndex === index ? "is-dragging" : ""}`}
            >
              <BoardCard
                board={board}
                setBoards={setBoards}
                isModalOpen={activeModalBoard === board._id}
                setActiveModalBoard={setActiveModalBoard}
                updateBoardNotes={updateBoardNotes}
              />
            </div>
          ))
        ) : (
          <div className="empty-state-container">
            <div className="empty-state-icon">📂</div>
            <h3 className="empty-state-title">No boards found</h3>
            <p className="empty-state-description">
              Your team hasn't created any boards yet. Start one above!
            </p>
            <div className="empty-state-arrow">↑</div>
          </div>
        )}
      </main>
    </div>
  );
}
