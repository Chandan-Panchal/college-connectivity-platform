import { Calendar, Download, Trash2, Image as ImageIcon, FileText, Type } from 'lucide-react';

export default function NotificationCard({ notification, onDelete, isAdmin }) {
    const { id, title, content, attachment_type, image_url, file_url, created_at } = notification;

    const dateFormatted = new Date(created_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const getTypeBadge = () => {
        switch (attachment_type) {
            case 'image':
                return { icon: <ImageIcon size={14} />, label: 'Image', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
            case 'pdf':
                return { icon: <FileText size={14} />, label: 'PDF', color: 'bg-red-500/15 text-red-400 border-red-500/30' };
            default:
                return { icon: <Type size={14} />, label: 'Text', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
        }
    };

    const badge = getTypeBadge();

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group shadow-lg">
            {attachment_type === 'image' && image_url && (
                <div className="w-full max-h-72 overflow-hidden">
                    <img src={image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
            )}

            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badge.color}`}>
                        {badge.icon} {badge.label}
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="text-white/40 text-xs flex items-center gap-1">
                            <Calendar size={12} /> {dateFormatted}
                        </span>
                        {isAdmin && (
                            <button
                                onClick={() => onDelete(id, image_url || file_url)}
                                className="text-white/30 hover:text-red-400 transition p-1"
                                title="Delete notification"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                {content && <p className="text-white/60 text-sm leading-relaxed mb-4">{content}</p>}

                {attachment_type === 'pdf' && file_url && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                        <iframe
                            src={file_url}
                            title={title}
                            width="100%"
                            height="400px"
                            className="bg-white rounded-xl"
                        />
                        <div className="flex justify-end p-3 bg-white/5">
                            <a
                                href={file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                            >
                                <Download size={14} /> Download PDF
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
