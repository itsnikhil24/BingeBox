import axios from "axios";
import API_BASE_URL from "../config/api";
import { refreshSession } from "./auth";

const API = `${API_BASE_URL}/api/video`;

export const getAllVideos = async () => {
  const response = await axios.get(API);
  return response.data.videos;
};

// Auth rides on the httpOnly session cookie (withCredentials). If the access
// token has expired, refresh once and retry; a second 401 propagates so the
// caller can treat the user as logged out.
export const uploadVideo = async (formData) => {
  const post = () =>
    axios.post(`${API}/upload`, formData, { withCredentials: true });

  try {
    const response = await post();
    return response.data;
  } catch (err) {
    if (err.response?.status !== 401) throw err;

    const refreshed = await refreshSession();
    if (!refreshed.success) throw err;

    const response = await post();
    return response.data;
  }
};

export const getVideoById = async (id) => {
  const response = await axios.get(`${API}/${id}`);
  return response.data.video;
};
