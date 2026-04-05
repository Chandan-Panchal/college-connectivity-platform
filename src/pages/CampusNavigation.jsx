import LiveCampusNavigation from "../components/LiveCampusNavigation";

export default function CampusNavigation(){

  return(

    <div className="p-6 space-y-8">

      <h1 className="text-3xl font-bold">

        College Campus Navigation

      </h1>

      {/* live location + route navigation */}

      <LiveCampusNavigation/>

    </div>

  )

}