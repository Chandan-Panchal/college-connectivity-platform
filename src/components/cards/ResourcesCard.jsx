import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function ResourcesCard() {
    return (
        <Link to="/resources" className="card-glass block hover:scale-105 transition-transform cursor-pointer">
            <div className="icon-wrapper">
                <BookOpen size={26} />
            </div>

            <h3 className="card-title">Resources</h3>
            <p className="card-desc">
                Access notes, study materials and previous year papers.
            </p>
        </Link>
    );
}
