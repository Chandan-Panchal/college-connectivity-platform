import { ArrowLeft, BadgePlus, Sparkles } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { clubsById } from '../data/clubs';

export default function ClubDetails() {
    const { id } = useParams();
    const club = clubsById[id];

    if (!club) {
        return <Navigate to="/clubs" replace />;
    }

    const ClubIcon = club.icon;

    return (
        <div className="mx-auto min-h-screen max-w-5xl px-6 py-12 text-white">
            <Link
                to="/clubs"
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
                <ArrowLeft size={16} />
                Back to Clubs
            </Link>

            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl md:p-8">
                <div className={`absolute inset-0 bg-gradient-to-br ${club.accent}`} />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

                <div className="relative">
                    <div className="mb-8 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70">
                                <Sparkles size={16} className="text-purple-300" />
                                Club spotlight
                            </div>
                            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">{club.name}</h1>
                            <p className="max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                                {club.description} This page is ready for richer club content later, including events, leadership info, and the real application workflow.
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%)]" />
                            <div className="relative flex h-full min-h-64 flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-white/5 text-center">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-purple-300">
                                    <ClubIcon size={38} />
                                </div>
                                <p className="mb-2 text-5xl" aria-hidden="true">{club.emoji}</p>
                                <p className="text-sm uppercase tracking-[0.3em] text-white/35">Banner Placeholder</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
                        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
                            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-white/35">What to expect</p>
                            <p className="text-white/65">
                                A dedicated club page, announcements, and applications can plug into this layout later without changing the routing structure.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-400/30 bg-purple-500/20 px-6 py-4 text-base font-medium text-white transition hover:bg-purple-500/30 active:scale-[0.99]"
                        >
                            <BadgePlus size={18} />
                            Apply Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
