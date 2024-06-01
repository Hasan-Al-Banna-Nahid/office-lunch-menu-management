"use client";
import { AuthContext } from "@/app/Authentication/AuthProvider/AuthProvider";
import { useContext } from "react";
import useAxiosSecure from "./useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useUser = () => {
  const { user, loading } = useContext(AuthContext);
  const [axiosSecure] = useAxiosSecure();
  const { data: isUser = {}, isLoading: isUserLoading } = useQuery({
    queryKey: ["isUser", user?.email],
    enabled:
      !!user?.email && !loading && !!localStorage.getItem("access-token"),
    queryFn: async () => {
      // console.log(user?.email);
      if (user?.email) {
        const res = await axiosSecure.get(`/user/user/${user?.email}`);
        // console.log(res.data.user);
        return await res.data.user;
      }
    },
  });
  return [isUser, isUserLoading];
};

export default useUser;
