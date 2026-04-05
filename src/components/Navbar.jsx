import { Menu, X, Trophy, Zap, LayoutDashboard, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import useUserPoints from "../hooks/useUserPoints";
import UserBadge from "./UserBadge";

export default function Navbar({ session }) {

    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();

    const userId = session?.user?.id;

    const { pointsData } = useUserPoints(userId);

    const handleLogout = async () => {

        await supabase.auth.signOut();

        navigate('/login');

    };

    const navLinks = session

        ? [

            { to: "/campus", label: "Campus Map" },

            { to: "/notifications", label: "Updates" },

            { to: "/resources", label: "Resources" },

            { to: "/buy-sell", label: "Marketplace" },

            { to: "/clubs", label: "Clubs" },

            { to: "/leaderboard", label: "Leaderboard" },

        ]

        : [

            { to: "/campus", label: "Campus Map" },

        ];

    return (

        <div className="relative w-full flex justify-center mt-6 px-4">

            <div className="w-full max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-2xl shadow-[0_8px_40px_rgba(139,92,246,0.18)]">

                <div className="flex items-center justify-between gap-4">

                    <Link to="/" className="flex items-center gap-3 text-white">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">

                            <Sparkles size={18} />

                        </div>

                        <div>

                            <p className="text-lg font-semibold leading-none md:text-xl">

                                CampusConnect

                            </p>

                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/35">

                                College Network

                            </p>

                        </div>

                    </Link>

                    <div className="hidden md:flex items-center gap-4">

                        {session ? (

                            <>

                                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2 py-2 text-sm text-white/75">

                                    {navLinks.map((link) => (

                                        <Link

                                            key={link.to}

                                            to={link.to}

                                            className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white"

                                        >

                                            {link.label}

                                        </Link>

                                    ))}

                                </div>

                                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-2">

                                    <div className="flex items-center gap-2 text-sm text-white">

                                        <Zap size={16} className="text-amber-300" />

                                        <span className="font-semibold">

                                            {pointsData.points} XP

                                        </span>

                                    </div>

                                    <UserBadge points={pointsData.points} />

                                </div>

                                <Link

                                    to="/dashboard"

                                    className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-200 transition hover:bg-purple-500/20"

                                >

                                    <LayoutDashboard size={16} />

                                    Dashboard

                                </Link>

                                <button

                                    onClick={handleLogout}

                                    className="rounded-full border border-white/10 px-4 py-3 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"

                                >

                                    Logout

                                </button>

                            </>

                        ) : (

                            <>

                                <div className="flex items-center gap-2">

                                    {navLinks.map((link) => (

                                        <Link

                                            key={link.to}

                                            to={link.to}

                                            className="rounded-full px-4 py-3 text-white/70 transition hover:bg-white/10 hover:text-white"

                                        >

                                            {link.label}

                                        </Link>

                                    ))}

                                </div>

                                <Link

                                    to="/login"

                                    className="rounded-full px-4 py-3 text-white/70 transition hover:bg-white/10 hover:text-white"

                                >

                                    Log In

                                </Link>

                                <Link

                                    to="/register"

                                    className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"

                                >

                                    Register

                                </Link>

                            </>

                        )}

                    </div>

                    <button

                        className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white md:hidden"

                        onClick={() => setIsOpen(!isOpen)}

                    >

                        {isOpen ? <X size={22} /> : <Menu size={22} />}

                    </button>

                </div>

            </div>

            {isOpen && (

                <div className="absolute top-full z-50 mt-4 w-[92%] max-w-md rounded-[2rem] border border-white/10 bg-[#120f20]/90 p-5 text-white/70 shadow-[0_18px_60px_rgba(139,92,246,0.22)] backdrop-blur-2xl md:hidden">

                    <Link

                        to="/"

                        onClick={() => setIsOpen(false)}

                        className="mb-4 block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"

                    >

                        Home

                    </Link>

                    {navLinks.map((link) => (

                        <Link

                            key={link.to}

                            to={link.to}

                            onClick={() => setIsOpen(false)}

                            className="mb-2 block rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white transition hover:bg-white/10"

                        >

                            {link.label}

                        </Link>

                    ))}

                </div>

            )}

        </div>

    );

}