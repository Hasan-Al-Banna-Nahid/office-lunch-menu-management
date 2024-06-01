import React from "react";

const GlowingCard = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <React.Fragment>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 font-bold">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-glow">
          <h2 className="text-2xl font-bold mb-4 PlaceholderName">
            Welcome to Your Favorite Ro Ben Dev's Lunch Menu !
          </h2>
          <p className="mb-4 text-slate-900">
            Please Close The Modal And Login With Your Credential If You Are A
            User,If Not Please Register
          </p>
          <p className="mb-4 text-slate-900">
            More Interesting Thing's Coming,
            <span className="brandName text-3xl italic ">Enjoy...</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-purple-800 w-full font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default GlowingCard;
