import { Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function ClubsCommunitiesCard() {
    return (
        <Link to="/clubs" className="card-glass block">
            <div className="icon-wrapper">
                <Users size={26} />
            </div>

            <h3 className="card-title">Clubs & Communities</h3>
            <p className="card-desc">
                Join student groups and stay connected with activities.
            </p>
        </Link>
    );
}
