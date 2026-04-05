import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function UpdatesCard() {
    return (
        <Link to="/notifications" className="card-glass hover:border-purple-500/50 transition cursor-pointer block">
            <div className="icon-wrapper">
                <Bell size={26} />
            </div>

            <h3 className="card-title">Updates & Notifications</h3>
            <p className="card-desc">
                Stay informed with announcements and important alerts.
            </p>
        </Link>
    );
}
