import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/", // change port if needed
  withCredentials: true, // useful if you use cookies later
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
