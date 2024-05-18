import { SERVER_API } from "../api/APIs";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: SERVER_API,
  headers: {
    "Accept": 'application/json',
    'Content-Type': 'application/json',
  },
  cache: false,
});

export default axiosInstance;
