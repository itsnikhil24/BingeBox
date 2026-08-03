import axios from "axios";

const API = "http://localhost:3000/api/video";

export const getAllVideos = async () => {
  const response = await axios.get(API);
  return response.data.videos;
};

export const uploadVideo = async (formData) => {
  const response = await axios.post(
    `${API}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
export const getVideoById = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data.video;
};