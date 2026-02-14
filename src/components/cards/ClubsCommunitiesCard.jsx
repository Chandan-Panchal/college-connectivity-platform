import { Users } from "lucide-react";

export default function ClubsCommunitiesCard() {
    return (
        <div className="card-glass">
            <div className="icon-wrapper">
                <Users size={26} />
            </div>

            <h3 className="card-title">Clubs & Communities</h3>
            <p className="card-desc">
                Join student groups and stay connected with activities.
            </p>
        </div>
    );
}
