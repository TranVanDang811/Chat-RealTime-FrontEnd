import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="h-full w-full flex items-center justify-center p-4 sm:p-6 md:p-8 py-8 sm:py-12 relative overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#020617] via-[#090d16] to-[#0a1128] font-sans selection:bg-blue-500/30">
      {/* Ambient glowing Midnight Blue gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Main card container */}
      <div className="relative z-10 w-full flex justify-center my-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
