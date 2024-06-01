"use client";
import React, { useEffect, useRef, useState } from "react";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import LoginPic from "../../../public/asset/login.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaPersonRunning } from "react-icons/fa6";
import LoadLoginData from "../libs/LoadLoginAPI";

const ClientLogin = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordVisibleClicked = () => {
    setIsPasswordVisible((prev) => !prev);
  };
  const router = useRouter();
  const passRef = useRef();
  const [isLoginPage, setIsLoginPage] = useState(false);
  const [isForgotPass, setIsForgotPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const pass = form.pass.value;
    await LoadLoginData(email, pass)
      .then((res) => console.log(res))
      .catch((err) => {
        console.log(err);
        return;
      });
    console.log(passRef.current.value);
  };
  const handleForgotPass = () => {
    setIsForgotPass(true);
  };
  const handleGoBack = () => {
    setIsForgotPass(false);
  };
  const handleGoToRegister = () => {
    setIsLoginPage(true);
    router.push("/Auth/Register");
  };
  return (
    <React.Fragment>
      <div className="hero  min-h-screen font-bold ">
        <div className="hero-content flex-col lg:flex-row-reverse bg-base-300 animate-glow2 rounded-lg">
          <div className="text-center lg:text-left">
            {/* <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
            <lottie-player
              src="https://lottie.host/8c80f416-d119-4e26-b2fb-6785526bf7e3/WEI1nnD5iB.json"
              background="##FFFFFF"
              speed="1"
              style={{ width: "300px", height: "300px" }}
              loop
              controls
              autoplay
              direction="1"
              mode="normal"
            ></lottie-player> */}
            <Image
              src={LoginPic}
              placeholder="blur"
              quality={100}
              alt="LoginThumbnail"
              className=" rounded-lg"
            />
          </div>
          <div className="card  shrink-0 w-full max-w-sm shadow-2xl ">
            {isForgotPass && (
              <button className="btn btn-error" onClick={handleGoBack}>
                Back
              </button>
            )}
            <form
              onSubmit={handleSubmit}
              className="card-body shadow-2xl rounded-lg"
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text brandName">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email"
                  className="input input-bordered PlaceholderName"
                  required
                  ref={passRef}
                  name="email"
                />
              </div>
              {isForgotPass ? (
                <></>
              ) : (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text brandName">Password</span>
                  </label>
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="password"
                    className="input input-bordered PlaceholderName"
                    required
                    name="pass"
                  />
                  <button
                    className="my-2"
                    type="button"
                    onClick={isPasswordVisibleClicked}
                  >
                    {isPasswordVisible ? (
                      <BsToggleOn className="text-2xl placeholderName" />
                    ) : (
                      <BsToggleOff className="text-2xl placeholderName" />
                    )}
                  </button>
                  <label className="label">
                    <p
                      className="label-text-alt link link-hover brandName"
                      onClick={handleForgotPass}
                    >
                      Forgot password?
                    </p>
                  </label>
                </div>
              )}
              <div>
                <div
                  onClick={handleGoToRegister}
                  className="PlaceholderName link link-accent bg-white rounded-lg p-6"
                >
                  {isLoginPage ? (
                    <p className="text-white text-2xl">
                      I'm Going... <FaPersonRunning className=" text-2xl" />{" "}
                    </p>
                  ) : (
                    <p>
                      Not A User,Please{" "}
                      <span className="brandName text-2xl">Register</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="form-control mt-6">
                <button className="btn btn-primary hover:btn-outline scale-75 hover:scale-110 placeholderName  transition-all text-xl ">
                  {isForgotPass ? "Please Press Me" : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ClientLogin;
