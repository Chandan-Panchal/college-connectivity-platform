import { Search, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-full flex justify-center mt-6 px-4">

            {/* Main Navbar */}
            <div className="
        w-full max-w-6xl
        px-6 py-4
        flex items-center justify-between
        rounded-3xl
        bg-white/5
        backdrop-blur-2xl
        border border-white/10
        shadow-[0_8px_40px_rgba(139,92,246,0.25)]
      ">

                {/* Logo */}
                <h1 className="text-xl md:text-2xl font-semibold text-white">
                    CampusConnect
                </h1>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-white/70">
                    <a href="#" className="hover:text-white transition">Home</a>
                    <a href="#" className="hover:text-white transition">About Us</a>
                    <a
                        href="#"
                        className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition"
                    >
                        Register
                    </a>
                    <Search size={20} className="cursor-pointer hover:text-white transition" />
                </div>

                {/* Mobile Button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="
          absolute top-full mt-4
          w-[90%] max-w-md
          bg-white/5
          backdrop-blur-2xl
          border border-white/10
          rounded-3xl
          p-6
          flex flex-col gap-6
          text-white/70
          shadow-[0_8px_40px_rgba(139,92,246,0.25)]
          z-50
          md:hidden
        ">
                    <a href="#" className="hover:text-white transition">Home</a>
                    <a href="#" className="hover:text-white transition">About Us</a>
                    <a
                        href="#"
                        className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition text-center"
                    >
                        Register
                    </a>
                    <div className="flex justify-center">
                        <Search size={20} className="cursor-pointer hover:text-white transition" />
                    </div>
                </div>
            )}

        </div>
    );
}
