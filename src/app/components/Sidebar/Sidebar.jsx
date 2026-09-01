"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("login");
    router.push("/LoginScreen");
  };

  return (
    <aside className="w-64  min-h-screen bg-gray-900 text-white">

      {/* Sidebar Menu */}
      <nav className="p-4 space-y-2">

        {/* Dashboard */}
        <Link
          href="/Dashboard/Dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          <span>🏠</span>
          <span>Dashboard</span>
        </Link>

        {/* Company */}
        <Link
       
          href="/Dashboard/CompanyScreen"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          <span>🏢</span>
          <span>Company</span>
        </Link>

        {/* User Master */}
        <Link
          href="/Dashboard/UserMaster"
           onClick={console.log("User master clicked")}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          <span>👤</span>
          <span>User Master</span>
        </Link>
        
        {/* MetalMaster*/}
        <Link
          href="/Dashboard/MetalMaster"
           onClick={console.log("User master clicked")}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          <span>🏭</span>
          <span>MetalMaster</span>
        </Link>
        {/* challanCreation */}
       <Link
      href="/Dashboard/ChallanCreation"
      onClick={() => console.log(" challanCreation clicked")}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
    >
     <span>🧾</span>
     <span>ChallanCreation</span>
      </Link>

      <Link
         href="/Dashboard/ChallanFormat"
         onClick={() => console.log(" challanFormat clicked")}
         className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 transition"
        >
        <span>🖨️</span>
       <span>ChallanFormat</span>
      </Link>

        
         {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition text-left"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>

      </nav>
    </aside>
  );
}