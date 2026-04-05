import { Download, User, Calendar } from 'lucide-react';

const RESOURCE_TYPE_LABELS = {
    notes: 'NOTES',
    pyq: 'PYQ',
    assignment: 'ASSIGNMENT',
    book: 'BOOK',
    other: 'OTHER',
};

export default function ResourceCard({ resource }) {
    const {
        title,
        subject,
        semester,
        resource_type,
        created_at,
        file_url,
        uploader,
        description,
    } = resource;

    const dateFormatted = created_at
        ? new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently';

    const getTypeColor = () => {
        switch (resource_type) {
            case 'notes': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'pyq': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'assignment': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'book': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
        }
    };

    return (
        <a
            href={file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor()}`}>
                    {RESOURCE_TYPE_LABELS[resource_type] || 'RESOURCE'}
                </span>
                <span className="text-white/40 text-xs flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                    <Calendar size={12} /> Sem {semester}
                </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{title}</h3>
            <p className="text-white/60 text-sm font-medium mb-3">{subject}</p>

            {description ? (
                <p className="text-white/50 text-sm mb-6 line-clamp-3 flex-grow">{description}</p>
            ) : (
                <div className="flex-grow"></div>
            )}

            <div className="pt-4 border-t border-white/10 mt-auto">
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-white/40 flex items-center gap-1">
                            <User size={12} /> {uploader?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-white/30">{dateFormatted}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-purple-600 group-hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-lg shadow-purple-600/20">
                        <Download size={16} /> Get PDF
                    </div>
                </div>
            </div>
        </a>
    );
}
