import { Compass, SearchX } from 'lucide-react';
import ClubCard from '../components/ClubCard';
import { clubs } from '../data/clubs';

export default function Clubs() {
    return (
        <div className="mx-auto min-h-screen max-w-6xl px-6 py-12 text-white">
            <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 backdrop-blur-2xl md:px-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
                            <Compass size={16} />
                            Discover campus communities
                        </div>
                        <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">Clubs & Communities</h1>
                        <p className="text-base leading-7 text-white/65 md:text-lg">
                            Explore student groups built around leadership, creativity, sport, and technology. Pick a club to view its dedicated space and application placeholder.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-white/60">
                        <p className="text-2xl font-semibold text-white">{clubs.length}</p>
                        <p>Active clubs listed</p>
                    </div>
                </div>
            </section>

            {clubs.length > 0 ? (
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {clubs.map((club, index) => (
                        <div
                            key={club.id}
                            className="animate-[fadeUp_0.5s_ease-out_forwards] opacity-0"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <ClubCard club={club} />
                        </div>
                    ))}
                </section>
            ) : (
                <section className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/5 px-6 py-20 text-center backdrop-blur-2xl">
                    <div className="mb-5 rounded-full border border-white/10 bg-white/5 p-5">
                        <SearchX size={42} className="text-white/30" />
                    </div>
                    <h2 className="mb-2 text-2xl font-semibold text-white">No clubs found</h2>
                    <p className="max-w-md text-white/55">
                        Club data is not available right now. Once clubs are added, they will appear here automatically.
                    </p>
                </section>
            )}
        </div>
    );
}
