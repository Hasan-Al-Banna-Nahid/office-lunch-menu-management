import axios from "axios";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

const useAxiosSecure = () => {
  // const { logOut } = useContext(AuthContext);
  const navigate = useRouter();

  const axiosSecure = axios.create({
    baseURL:
      "http://localhost:5000/api/v1" && "http://localhost:5000/api/v1/auth",
  });

  useEffect(() => {
    axiosSecure.interceptors.request.use((config) => {
      const token = localStorage.getItem("access-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          // await logOut();
          navigate.push("/Auth/Login");
          localStorage.removeItem("access-token");
        }
        return Promise.reject(error);
      }
    );
  }, [logOut, navigate, axiosSecure]);

  return [axiosSecure];
};

export default useAxiosSecure;
