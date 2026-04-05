import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClubCard({ club }) {
    const ClubIcon = club.icon;

    return (
        <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_20px_60px_rgba(139,92,246,0.18)]">
            <div className={`absolute inset-0 bg-gradient-to-br ${club.accent} opacity-80 transition duration-300 group-hover:opacity-100`} />
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-3xl transition duration-300 group-hover:scale-125" />

            <div className="relative flex h-full flex-col">
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-purple-300 shadow-inner shadow-white/5">
                        <ClubIcon size={26} />
                    </div>
                    <span className="text-3xl" aria-hidden="true">{club.emoji}</span>
                </div>

                <div className="mb-6 space-y-3">
                    <h3 className="text-2xl font-semibold text-white">{club.name}</h3>
                    <p className="text-sm leading-6 text-white/65">{club.description}</p>
                </div>

                <Link
                    to={`/clubs/${club.id}`}
                    className="relative mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:border-purple-400/40 hover:bg-purple-500/20"
                >
                    View Club
                    <ArrowRight size={16} className="transition duration-300 group-hover:translate-x-1" />
                </Link>
            </div>
        </article>
    );
}
