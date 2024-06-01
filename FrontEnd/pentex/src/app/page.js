"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlowingCard from "./Common/GlowingCard";
export default function Home() {
  const [showCard, setShowCard] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setShowCard(true);
  }, []);

  const handleClose = () => {
    router.push("/Auth/Login");
    setShowCard(false);
  };

  return (
    <React.Fragment>
      <Suspense
        fallback={<p className="font-bold text-5xl text-center">Loading...</p>}
      >
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <GlowingCard show={showCard} onClose={handleClose} />
        </div>
        {handleClose && (
          <span className="loading loading-dots w-[500px] mx-auto bg-slate-950 p-12"></span>
        )}
      </Suspense>
    </React.Fragment>
  );
}
