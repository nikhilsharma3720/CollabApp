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

  const fetchBoardsByTeam = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const res = await api.get(`/boards/fetchByTeamId/${teamId}`, { withCredentials: true });
      const boardData = Array.isArray(res.data) ? res.data : res.data.boards || [];
      setBoards(boardData);
    } catch (err) {
      toast.error("Failed to load boards");
    } finally {
      // Small timeout to let the skeleton shine
      setTimeout(() => setLoading(false), 800);
    }
  }, [teamId]);

  useEffect(() => {
    fetchBoardsByTeam();
  }, [fetchBoardsByTeam]);

  useEffect(() => {
    if (!teamId || !user?.id) return;
    const roomName = `team:${teamId}`;
    socket.emit("joinTeam", { teamId: roomName, user: { _id: user.id, name: user.name, email: user.email } });

    socket.on("board-created", (newBoard) => {
      setBoards((prev) => (prev.some(b => b._id === newBoard._id) ? prev : [...prev, newBoard]));
    });

    socket.on("board-deleted", ({ boardId }) => {
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
    });

    socket.on("team-users-count", (data) => {
      setOnlineUsers(Array.isArray(data) ? data.length : data);
    });

    return () => {
      socket.off("board-created");
      socket.off("board-deleted");
      socket.off("team-users-count");
    };
  }, [teamId, user]);

  const handleAddBoard = async () => {
    if (!newBoardTitle.trim() || isCreating) return;
    setIsCreating(true);
    try {
      await api.post("/boards", { title: newBoardTitle, teamId }, { withCredentials: true });
      setNewBoardTitle("");
      toast.success("Board created!");
    } catch (err) {
      toast.error("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(teamJoinCode);
    toast.success("Invite code copied!");
  };

  return (
    <div className="app-wrapper">
      <header className="workspace-header">
        <div className="header-main">
          {/* LEFT SIDE: Team Context */}
          <div className="workspace-left">
            <div className="breadcrumb">Workspace / <strong>{teamName}</strong></div>
            <div className="title-row">
              <h1>{teamName}</h1>
              <div className="online-indicator">
                <span className="pulse-dot"></span>
                {onlineUsers} Active Now
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Beautiful Tools */}
          <div className="workspace-right">
            {teamJoinCode && (
              <div className="invite-pill" onClick={copyToClipboard}>
                <span className="pill-label">Invite Code:</span>
                <span className="pill-value">{teamJoinCode}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              </div>
            )}
            <div className="v-divider"></div>
            <div className="board-input-wrapper">
              <input
                type="text"
                placeholder="New board name..."
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddBoard()}
              />
              <button onClick={handleAddBoard} disabled={isCreating}>
                {isCreating ? "..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="boards-scroll-area">
        {loading ? (
          <div className="boards-flex-container">
            {[...Array(4)].map((i) => (
              <div key={i} className="board-outer-wrap">
        <div className="skeleton-board">
          <div className="skeleton-header"></div>
          <div className="skeleton-note"></div>
          <div className="skeleton-note"></div>
          <div className="skeleton-note"></div>
          <div className="skeleton-note" style={{height: '40px', marginTop: 'auto'}}></div> 
        </div>
      </div>
            ))}
          </div>
        ) : boards.length > 0 ? (
          <div className="boards-flex-container">
            {boards.map((board, index) => (
              <div
                key={board._id}
                draggable
                onDragStart={() => setDraggedBoardIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const reordered = [...boards];
                  const [moved] = reordered.splice(draggedBoardIndex, 1);
                  reordered.splice(index, 0, moved);
                  setBoards(reordered);
                }}
                className={`board-outer-wrap ${draggedBoardIndex === index ? "is-ghost" : ""}`}
              >
                <BoardCard
                  board={board}
                  setBoards={setBoards}
                  isModalOpen={activeModalBoard === board._id}
                  setActiveModalBoard={setActiveModalBoard}
                  updateBoardNotes={(id, notes) => setBoards(prev => prev.map(b => b._id === id ? {...b, notes} : b))}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="modern-empty-state">
            <div className="empty-icon-wrap">📂</div>
            <h2>Clean slate</h2>
            <p>Ready to start something new? Create your first board above.</p>
          </div>
        )}
      </main>
    </div>
  );
}