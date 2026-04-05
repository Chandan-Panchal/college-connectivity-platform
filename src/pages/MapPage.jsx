import LiveMap from "../components/LiveMap";
import CustomCampusMap from "../components/CustomCampusMap";
import LiveCampusNavigation from "../components/LiveCampusNavigation";
export default function MapPage(){

  return(

    <div className="min-h-screen p-6 space-y-10 bg-[#0b0b0f]">

      <h1 className="text-3xl font-bold text-white">

        College Campus Navigation

      </h1>

      {/* live satellite map */}

      <LiveMap/>

      {/* clickable campus map */}

      <CustomCampusMap/>

    </div>

  )

}