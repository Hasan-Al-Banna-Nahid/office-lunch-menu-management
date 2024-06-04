import axios from "axios";

const LoadLoginData = async (email, password) => {
  const Auth = process.env.auth;
  console.log(Auth);
  const result = await axios.post(Auth, { email, password });
  return result;
};
export default LoadLoginData;
