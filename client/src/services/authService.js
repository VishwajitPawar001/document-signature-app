import axios from "axios";

const BASE_URL = "${import.meta.env.VITE_API_URL}/api/auth";

export const registerUser = async (userData) => {
  const response = await axios.post(`${BASE_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axios.post(`${BASE_URL}/login`, userData);
  return response.data;
};