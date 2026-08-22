import axios from "axios";

const API = "http://localhost:3000/api/video";

export const getAllVideos = async () => {
  const response = await axios.get(API);
  return response.data.videos;
};

export const uploadVideo = async (formData) => {
  const sessionString = localStorage.getItem("session");

  if (!sessionString) {
    throw new Error("Session not found. Please login again.");
  }

  const session = JSON.parse(sessionString);

  if (!session.access_token) {
    throw new Error("Access token not found. Please login again.");
  }

  const response = await axios.post(
    `${API}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  return response.data;
};

export const getVideoById = async (id) => {
  const response = await axios.get(`${API}/${id}`);
  return response.data.video;
};