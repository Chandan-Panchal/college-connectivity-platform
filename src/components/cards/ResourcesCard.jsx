import { BookOpen } from "lucide-react";

export default function ResourcesCard() {
    return (
        <div className="card-glass">
            <div className="icon-wrapper">
                <BookOpen size={26} />
            </div>

            <h3 className="card-title">Resources</h3>
            <p className="card-desc">
                Access notes, study materials and previous year papers.
            </p>
        </div>
    );
}
