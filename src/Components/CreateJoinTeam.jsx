import React, { useState, useEffect } from "react";
import api from "../api/axios";  
import { useDispatch, useSelector } from "react-redux";
import { setTeamAndBoards } from "../../redux/Slices/teamBoardSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Navbar.css";  

const CreateJoinTeam = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const userId = user?.id || JSON.parse(localStorage.getItem("user"))?.id;

    if (!userId) {
      console.log("No User ID found yet...");
      return;
    }

    const fetchMyTeams = async () => {
      try {
        const res = await api.get(`/getMyTeams/${userId}`);
        setTeams(res.data);
      } catch (err) {
        console.error("Failed to fetch teams", err);
      }
    };

    fetchMyTeams();
  }, [user?.id]);

  /* ================= HANDLERS ================= */
  const handleSelectExistingTeam = (team) => {
    localStorage.setItem("teamId", team._id);
    localStorage.setItem("teamName", team.name);
    localStorage.setItem("teamJoinCode", team.joinCode);

    toast.success(`Switched to workspace: ${team.name}`, { icon: "🏢" });

    navigate("/boards");
  };
  const handleCreateTeam = async () => {
    if (!teamName.trim()) return toast.error("Please enter a team name");
    setLoading(true);
    try {
      const { data } = await api.post(
        "/createTeam",
        { name: teamName },
        { withCredentials: true },
      );
      localStorage.setItem("teamId", data._id);
      localStorage.setItem("teamName", data.name);
      localStorage.setItem("teamJoinCode", data.joinCode);
      toast.success(`Team "${data.name}" created!`);
      navigate("/boards");
    } catch (err) {
      toast.error("Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    if (e) e.preventDefault();
    if (!joinCode) return toast.error("Please enter a join code");
    setLoading(true);
    try {
      const { data } = await api.post(
        "/joinTeam",
        { joinCode },
        { withCredentials: true },
      );
      localStorage.setItem("teamId", data.team._id);
      localStorage.setItem("teamName", data.team.name);
      localStorage.setItem("teamJoinCode", data.team.joinCode);
      dispatch(
        setTeamAndBoards({ team: data.team, boards: data.boards || [] }),
      );
      toast.success(`Joined ${data.team.name}`);
      navigate("/boards");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid Join Code");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (e, teamId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this team?")) return;

    try {
      await api.delete(`/leaveTeam/${teamId}`, { withCredentials: true });
      setTeams((prev) => prev.filter((t) => t._id !== teamId));

      if (localStorage.getItem("teamId") === teamId) {
        localStorage.removeItem("teamId");
        localStorage.removeItem("teamName");
        localStorage.removeItem("teamJoinCode");
      }
      toast.success("Team removed");
    } catch (err) {
      toast.error("Failed to remove team");
    }
  };

  return (
    <div className="team-page-container">
      <header className="team-hero">
        <h1 className="hero-title">Select your workspace</h1>
        <p className="hero-subtitle">
          Create a new team or join an existing one to start collaborating.
        </p>
      </header>

      <div className="team-actions-wrapper">
        {/* Create Team Card */}
        <div className="action-card">
          <div className="card-badge create">New</div>
          <h3>Create Team</h3>
          <p>Launch a fresh space for your projects.</p>
          <div className="action-input-box">
            <input
              type="text"
              placeholder="Team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            <button
              onClick={handleCreateTeam}
              className="btn-main"
              disabled={loading}
            >
              {loading ? "..." : "Create"}
            </button>
          </div>
        </div>

        <div className="visual-divider">
          <div className="line"></div>
          <span>or</span>
          <div className="line"></div>
        </div>

        {/* Join Team Card */}
        <div className="action-card">
          <div className="card-badge join">Invite</div>
          <h3>Join Team</h3>
          <p>Access a team using an invite code.</p>
          <form onSubmit={handleJoinTeam} className="action-input-box">
            <input
              type="text"
              placeholder="Code: XA23-..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button
              type="submit"
              className="btn-main secondary"
              disabled={loading}
            >
              {loading ? "..." : "Join"}
            </button>
          </form>
        </div>
      </div>

      <section className="workspaces-section">
        <div className="section-header">
          <h3>Your Workspaces</h3>
          <span className="workspace-badge">{teams.length} total</span>
        </div>

        {teams.length === 0 ? (
          <div className="empty-teams">
            <p>You aren't part of any teams yet.</p>
          </div>
        ) : (
          <div className="workspace-grid">
            {teams.map((team) => (
              <div
                key={team._id}
                className="workspace-card"
                onClick={() => handleSelectExistingTeam(team)}
              >
                <div className="workspace-avatar">{team.name.charAt(0)}</div>
                <div className="workspace-details">
                  <span className="ws-name">{team.name}</span>
                  <span className="ws-meta">Code: {team.joinCode}</span>
                </div>
                <div className="workspace-actions">
                  <span className="ws-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CreateJoinTeam;
