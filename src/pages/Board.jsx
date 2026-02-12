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
      const res = await api.get(`/boards/fetchByTeamId/${teamId}`, {
        withCredentials: true,
      });
      const boardData = Array.isArray(res.data)
        ? res.data
        : res.data.boards || [];
      setBoards(boardData);
    } catch (err) {
      toast.error("Failed to load boards");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [teamId]);

  useEffect(() => {
    fetchBoardsByTeam();
  }, [fetchBoardsByTeam]);

  useEffect(() => {
    if (!teamId || !user?.id) return;
    const roomName = `team:${teamId}`;

    // Join the team room with user details
    socket.emit("joinTeam", {
      teamId: roomName,
      user: { _id: user.id, name: user.name, email: user.email },
    });

    // 1. Listen for Board Creation with "Who" attribution
    socket.on("board-created", (data) => {
      console.log("data", data);
      // Data structure: { board: {...}, creatorName: "John", creatorId: "..." }
      const newBoard = data.board || data;
      const creator = data?.createdBy?.name || "Someone";
      const creatorId = data.creatorId;

      setBoards((prev) =>
        prev.some((b) => b._id === newBoard._id) ? prev : [...prev, newBoard],
      );

      // Only show toast if the current user DID NOT create it
      if (creatorId !== user.id) {
        toast.success(`${creator} created a new board: ${newBoard.title}`, {
          icon: "🚀",
          duration: 4000,
        });
      }
    });

    // 2. Listen for Board Deletion with attribution
    socket.on("board-deleted", (data) => {
      // 1. Extract data safely based on your console log
      const boardId = data.boardId || data._id;
      const boardTitle = data.boardTitle || "a board";

      // Since name is in data.deletedBy.name, ID is likely in data.deletedBy._id
      const deleterName = data?.deletedBy?.name || "Someone";
      const deleterId = data?.deletedBy?._id || data?.deletedBy?.id;

      console.log("Deleter ID:", deleterId, "Current User ID:", user.id);

      // 2. Update the UI state immediately
      setBoards((prev) => prev.filter((b) => b._id !== boardId));

      // 3. Show Toast
      // We use String() to make sure we aren't comparing a MongoDB Object to a String

      toast.error(`${deleterName} deleted "${boardTitle}"`, {
        icon: "🗑️",
        duration: 4000,
      });
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
      // We pass the user name in the request so the backend can broadcast who created it
      await api.post(
        "/boards",
        {
          title: newBoardTitle,
          teamId,
          creatorName: user.name, // Helping the backend attribute the action
        },
        { withCredentials: true },
      );

      setNewBoardTitle("");
      toast.success("Board initiated!");
    } catch (err) {
      toast.error("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    if (!teamJoinCode) return;
    navigator.clipboard.writeText(teamJoinCode);
    toast.success("Invite code copied!", { position: "bottom-center" });
  };

  return (
    <div className="app-wrapper">
      <header className="workspace-header">
        <div className="header-main">
          {/* LEFT SIDE: Team Context */}
          <div className="workspace-left">
            <div className="breadcrumb">
              Workspace / <strong>{teamName}</strong>
            </div>
            <div className="title-row">
              <h1>{teamName}</h1>
              <div className="online-indicator">
                <span className="pulse-dot"></span>
                <span className="active-text">{onlineUsers} Active Now</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Beautiful Tools */}
          <div className="workspace-right">
            {teamJoinCode && (
              <div
                className="invite-pill"
                onClick={copyToClipboard}
                title="Click to copy invite code"
              >
                <span className="pill-label">Code:</span>
                <span className="pill-value">{teamJoinCode}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </div>
            )}
            <div className="v-divider"></div>
            <div className="board-input-wrapper">
              <input
                type="text"
                placeholder="New board title..."
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="board-outer-wrap">
                <div className="skeleton-board">
                  <div className="skeleton-header"></div>
                  <div className="skeleton-note"></div>
                  <div className="skeleton-note"></div>
                  <div className="skeleton-note"></div>
                  <div
                    className="skeleton-note"
                    style={{ height: "40px", marginTop: "auto" }}
                  ></div>
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
                  updateBoardNotes={(id, notes) =>
                    setBoards((prev) =>
                      prev.map((b) => (b._id === id ? { ...b, notes } : b)),
                    )
                  }
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
