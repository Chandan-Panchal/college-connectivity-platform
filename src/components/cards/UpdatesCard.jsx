import { Bell } from "lucide-react";

export default function UpdatesCard() {
    return (
        <div className="card-glass">
            <div className="icon-wrapper">
                <Bell size={26} />
            </div>

            <h3 className="card-title">Updates & Notifications</h3>
            <p className="card-desc">
                Stay informed with announcements and important alerts.
            </p>
        </div>
    );
}
