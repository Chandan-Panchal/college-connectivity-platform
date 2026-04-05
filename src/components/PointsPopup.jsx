import { Gift } from 'lucide-react';

export default function PointsPopup({ reward }) {
    if (!reward) return null;

    return (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[70] animate-[fadeUp_0.35s_ease-out_forwards]">
            <div className="min-w-64 rounded-3xl border border-emerald-400/20 bg-emerald-500/15 p-4 text-white shadow-[0_18px_50px_rgba(16,185,129,0.25)] backdrop-blur-2xl">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-500/20 p-2 text-emerald-200">
                        <Gift size={18} />
                    </div>
                    <div>
                        <p className="font-semibold text-emerald-100">+{reward.amount} points earned 🎉</p>
                        <p className="mt-1 text-sm text-white/70">You are now level {reward.level} with {reward.points} XP.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
