import axios from "axios";

const { default: useAxiosSecure } = require("../Hooks/useAxiosSecure");

const LoadLoginData = async (email, pass) => {
  const url = "http://localhost:5000/api/v1/auth/login";
  const result = axios.post(url, email, pass);
  return await result.json();
};
export default LoadLoginData;
