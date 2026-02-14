import { MapPin } from "lucide-react";

export default function CollegeCampusCard() {
    return (
        <div className="card-glass">
            <div className="icon-wrapper">
                <MapPin size={26} />
            </div>

            <h3 className="card-title">College Campus</h3>
            <p className="card-desc">
                Navigate classrooms, labs and key campus locations easily.
            </p>
        </div>
    );
}
