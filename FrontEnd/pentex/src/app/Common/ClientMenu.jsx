"use client";
import React, { useEffect, useState } from "react";
import useAxiosSecure from "../Hooks/useAxiosSecure";

const ClientMenu = () => {
  const user =
    typeof window !== "undefined" &&
    JSON.parse(window.localStorage.getItem("user"));
  const [menus, setMenus] = useState([]);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axiosSecure.get("/menus");
        console.log("API Response:", response.data);
        setMenus(response.data);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      }
    };

    fetchMenus();
  }, [axiosSecure]);

  console.log("Menus State:", menus);
  return (
    <React.Fragment>
      <div className="animate-glow animate-glow2 text-center text-5xl brandName PlaceholderName bg-white p-2 font-bold">
        Welcome Engineer{" "}
        <span className="animate-glow2 animate-glow rounded-md  z-50 text-white p-2 font-bold">
          {(user && user.name) || (user && user.username)}
        </span>
      </div>
      {/* Table */}
      <div className="mockup-phone border-primary mx-auto w-[1300px] bg-white ">
        <div className="camera w-[1200px]"></div>
        <div className="display">
          {/* <div className="artboard artboard-demo phone-1 w-[1200px]">Hi.</div> */}
          <div className="overflow-x-auto">
            <table className="table tableColor font-bold text-xl">
              {/* head */}
              <thead className=" text-slate-800 font-bold text-xl">
                <tr>
                  <th></th>
                  <th>Menu's</th>
                  {/* <th>Job</th> */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                <tr className="bg-base-200">
                  <th>1</th>
                  <td>Cy Ganderton</td>
                  <td>Quality Control Specialist</td>
                  <td>Blue</td>
                </tr>
                {/* row 2 */}
                <tr>
                  <th>2</th>
                  <td>Hart Hagerty</td>
                  <td>Desktop Support Technician</td>
                  <td>Purple</td>
                </tr>
                {/* row 3 */}
                <tr>
                  <th>3</th>
                  <td>Brice Swyre</td>
                  <td>Tax Accountant</td>
                  <td>Red</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Table */}
    </React.Fragment>
  );
};

export default ClientMenu;
