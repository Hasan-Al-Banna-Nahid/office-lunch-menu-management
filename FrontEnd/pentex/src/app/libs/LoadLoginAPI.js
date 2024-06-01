import axios from "axios";

const { default: useAxiosSecure } = require("../Hooks/useAxiosSecure");

const LoadLoginData = async (email, password) => {
  const url = "http://localhost:5000/api/v1/auth/login";
  const result = await axios.post(url, { email, password });
  return result;
};
export default LoadLoginData;
