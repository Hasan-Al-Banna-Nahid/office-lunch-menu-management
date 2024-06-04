"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const useAxiosSecure = () => {
  const navigate = useRouter();
  const axiosSecure = useRef(null);

  if (!axiosSecure.current) {
    axiosSecure.current = axios.create({
      baseURL: "http://localhost:5000/api/v1",
    });

    axiosSecure.current.interceptors.request.use((config) => {
      const token = localStorage.getItem("access-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    axiosSecure.current.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          navigate.push("/Auth/Login");
          localStorage.removeItem("access-token");
        }
        return Promise.reject(error);
      }
    );
  }

  return axiosSecure.current;
};

export default useAxiosSecure;
