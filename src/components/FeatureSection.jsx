import { Link } from "react-router-dom";

import CollegeCampusCard from "./cards/CollegeCampusCard";
import ClubsCommunitiesCard from "./cards/ClubsCommunitiesCard";
import ResourcesCard from "./cards/ResourcesCard";
import UpdatesCard from "./cards/UpdatesCard";
import BuySellCard from "./cards/BuySellCard";

export default function FeatureSection() {

    return (

        <section className="mt-24 flex justify-center px-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">

                {/* campus map clickable */}

                <Link to="/campus">

                    <CollegeCampusCard />

                </Link>

                <ClubsCommunitiesCard />

                <ResourcesCard />

                <UpdatesCard />

                <BuySellCard />

            </div>

        </section>

    );

}