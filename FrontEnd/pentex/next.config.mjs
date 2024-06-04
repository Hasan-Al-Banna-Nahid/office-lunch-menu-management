/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { auth: "http://localhost:5000/api/v1/auth/login" },
  // images: {
  //   // domains: ["localhost"],
  //   remotePatterns: [
  //     {
  //       protocol: "http",
  //       hostname: "http://localhost",
  //       port: "5000",
  //       pathname:
  //         "E:/Projects/My Website Projects/Office-Lunch-Management/Backend/**", // Adjust the path as needed
  //     },
  //   ],
  // },
};

export default nextConfig;
