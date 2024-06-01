"use client";
import { AuthContext } from "@/app/Authentication/AuthProvider/AuthProvider";
import { useContext } from "react";
import useAxiosSecure from "./useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useAdmin = () => {
  const { user, loading } = useContext(AuthContext);
  const [axiosSecure] = useAxiosSecure();
  const { data: isAdmin = {}, isLoading: isAdminLoading } = useQuery({
    queryKey: ["isAdmin", user?.email],
    enabled:
      !!user?.email && !loading && !!localStorage.getItem("access-token"),
    queryFn: async () => {
      // console.log(user?.email);
      if (user?.email) {
        const res = await axiosSecure.get(`/user/admin/${user?.email}`);
        // console.log(res.data.admin);
        return await res.data.admin;
      }
    },
  });
  return [isAdmin, isAdminLoading];
};

export default useAdmin;
