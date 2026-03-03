import axios from "axios";

const BASE_URL = "http://localhost:5000/api/documents";

export const uploadDocument = async (file) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("User not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${BASE_URL}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getMyDocuments = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("User not authenticated");
  }

  const response = await axios.get(
    `${BASE_URL}/my-documents`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getDocumentById = async (id) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `http://localhost:5000/api/documents/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};