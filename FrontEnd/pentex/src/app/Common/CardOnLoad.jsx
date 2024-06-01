// "use client";
// import React, { useEffect, useState } from "react";
// import GlowingCard from "./GlowingCard";
// import { useRouter } from "next/navigation";
// export default function Home() {
//   const [showCard, setShowCard] = useState(false);
//   const router = useRouter();
//   useEffect(() => {
//     setShowCard(true);
//   }, []);

//   const handleClose = () => {
//     setShowCard(false);
//     router.push("/Auth/Login");
//   };

//   return (
//     <React.Fragment>
//       <div className="flex items-center justify-center min-h-screen bg-gray-100">
//         <GlowingCard show={showCard} onClose={handleClose} />
//       </div>
//     </React.Fragment>
//   );
// }
