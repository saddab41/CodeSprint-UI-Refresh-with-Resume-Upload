import axios from "axios";
import type { Portfolio } from "../types/portfolio";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getPortfolio = async () => {
  const response = await axios.get(
    `${API}/profile/portfolio`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

export const updatePortfolio = async (
  portfolio: Portfolio
) => {
  const response = await axios.put(
    `${API}/profile/portfolio`,
    portfolio,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

export const updateResume = async (
  payload: Record<string, unknown>
) => {
  const response = await axios.put(
    `${API}/profile/resume`,
    payload,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};
