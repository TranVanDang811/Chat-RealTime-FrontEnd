import React from "react";
import { Outlet } from "react-router-dom";

const Auth = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <Outlet /> {/* render login / register page */}
      </div>
    </div>
  );
};

export default Auth;