import { useMemo, useState } from "react";
import campusMap from "../assets/campus-full.png";

// Campus center based on official GEC Ajmer coordinates:
// 26°27'13" N, 74°42'30" E  => 26.453611, 74.708333
// Building-level lat/lng below are approximate campus offsets for integration use.
// Replace them later with exact Google Maps per-building points if needed.

const locations = [
  {
    id: "main-gate",
    name: "Main Gate",
    top: "90%",
    left: "25%",
    lat: 26.45195,
    lng: 74.70695,
    clickable: true,
    floors: [],
    description: "Main campus entry point near NH-8 .",
  },

  {
    id: "canteen",
    name: "Canteen",
    top: "58%",
    left: "10%",
    lat: 26.4530,
    lng: 74.7061,
    clickable: true,
    floors: [],
    description: "Campus canteen area.",
  },

  {
    id: "civil-block",
    name: "Civil Block",
    top: "68%",
    left: "72%",
    lat: 26.45295,
    lng: 74.70935,
    clickable: true,
    description: "Separate Civil Engineering block.",
    floors: [
      {
        floor: "Ground Floor",
        rooms: [
          {
            roomNo: "CB-01",
            name: "Civil Office",
            teachers: [],
            direction: "Entry se straight jao, left side office",
          },
          {
            roomNo: "CB-02",
            name: "Survey Lab",
            teachers: [],
            direction: "Go straight  from entry gate , right side lab",
          },
          {
            roomNo: "CB-03",
            name: "Dinesh meen",
            teachers: ["Dr Sharma"],
            direction: "left corridor last cabin",
          },
        ],
      },
      {
        floor: "First Floor",
        rooms: [
          {
            roomNo: "CB-101",
            name: "Classroom 1",
            teachers: [],
            direction: "First floor right side first classroom",
          },
          {
            roomNo: "CB-102",
            name: "SOM Lab",
            teachers: ["Shikha"],
            direction: "First floor left side lab",
          },
        ],
      },
    ],
  },

  {
    id: "library",
    name: "Library",
    top: "51%",
    left: "60%",
    lat: 26.45345,
    lng: 74.70895,
    clickable: true,
    description: "Central library block.",
    floors: [],
  },

  {
    id: "old-building",
    name: "Old Building",
    top: "43%",
    left: "42%",
    lat: 26.45355,
    lng: 74.70775,
    clickable: true,
    description: "One of the  main academic buildings.",
    floors: [
      {
        floor: "Ground Floor",
        rooms: [
          {
            roomNo: "G24",
            name: " HOD Office",
            teachers: ["S.N Taji"],
            direction: "Right side from Entry",
          },
          {
            name: "Assistent professor",
            teachers: ["Parkash Meena"],
            direction: "Right side third cabin",
          },
          {
            name: "DR.V.P Sharma",
            teachers: ["DR.V.P Sharma"],
            direction: "Right corridor second cabin",
          },
          {
            name: "Account Section ",
            teachers: [],
            direction: "Right corridor last room ",
          },
          {
            name: "Computer Center",
            teachers: [],
            direction: "Left side to Account Section ",
          },
          {
            name: "G24",
            teachers: ["Dr Monica Sharma , Dr. Kapil Sharma, Dr. Avinash Bhandiya"],
            direction: "Left side to Account Section ",
          },
          {
            name: "Computer Lab ",
            teachers: [],
            direction: "right coridoor last corner ",
          },
          {
            roomNo: "G22",
            name: "Lab A",
            teachers: [],
            direction: "Right corridor second cabin",
          },
        ],
      },
      {
        floor: "First Floor",
        rooms: [
          {
            name: "TPO Hall",
            teachers: [],
            direction: "Right side to stair ",
          },
          {
            name: "Captain H.R Chodhary ",
            teachers: [],
            direction: "Left side to Stair ",
          },
          {
            name: "Dr. Shikha Gupta ",
            teachers: ["Dr. Shikha Gupta "],
            direction: "Left side to Stair ",
          },
        ],
      },
    ],
  },

  {
    id: "new-building",
    name: "New Building",
    top: "28%",
    left: "50%",
    lat: 26.45415,
    lng: 74.7082,
    clickable: true,
    description: "One of the two main academic buildings.",
    floors: [
      {
        floor: "Ground Floor",
        rooms: [
          {
            name: "Dr. Shalini ",
            teachers: [],
            direction: "left side from entry",
          },
          {
            name: "Chemistry Lab",
            teachers: [],
            direction: "Right side first lab from entry",
          },
        ],
      },
      {
        floor: "First Floor",
        rooms: [
          {
            roomNo: "NB-101",
            name: "Communication skill lab ",
            teachers: [],
            direction: "Left corridor department",
          },
          {
            roomNo: "NB-102",
            name: "CAMD lab ",
            teachers: [],
            direction: "Right side second room",
          },
          {
            roomNo: "NB-103",
            name: "HOD Cabin of ECE",
            teachers: ["Dr Gupta"],
            direction: "Right  corner cabin from stairs",
          },
        ],
      },
    ],
  },

  {
    id: "rcat-center",
    name: "RCAT Center",
    top: "36%",
    left: "58%",
    lat: 26.45405,
    lng: 74.70855,
    clickable: true,
    floors: [],
    description: "RCAT Center among old building and new building .",
  },

  {
    id: "mechanical-building",
    name: "Mechanical Workshop ",
    top: "25%",
    left: "74%",
    lat: 26.4542,
    lng: 74.70945,
    clickable: true,
    floors: [],
    description: "right side to new building near girls hostel .",
  },

  {
    id: "girls-hostel",
    name: "Girls Hostel",
    top: "15%",
    left: "68%",
    lat: 26.45495,
    lng: 74.70915,
    clickable: true,
    floors: [],
    description: "Go straight and turn left .",
  },

  {
    id: "guest-house",
    name: "Guest House",
    top: "15%",
    left: "50%",
    lat: 26.45495,
    lng: 74.7082,
    clickable: true,
    floors: [],
    description: "Guest house in rear-side zone.",
  },

  {
    id: "sports-section",
    name: "Vollyball Ground",
    top: "48%",
    left: "22%",
    lat: 26.45335,
    lng: 74.70715,
    clickable: true,
    floors: [],
    description: "near old building side.",
  },
];

export default function CustomCampusMap() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();

  const buildingResults = useMemo(() => {
    if (!query) return [];

    return locations.filter((building) =>
      String(building?.name || "").toLowerCase().includes(query)
    );
  }, [query]);

  const roomResults = useMemo(() => {
    if (!query) return [];

    const matches = [];

    locations.forEach((building) => {
      if (!building?.floors?.length) return;

      building.floors.forEach((floor) => {
        if (!floor?.rooms?.length) return;

        floor.rooms.forEach((room) => {
          const roomNo = String(room?.roomNo || "").toLowerCase();
          const roomName = String(room?.name || "").toLowerCase();
          const teachers = Array.isArray(room?.teachers) ? room.teachers : [];

          const teacherMatch = teachers.some((t) =>
            String(t || "").toLowerCase().includes(query)
          );

          if (
            roomNo.includes(query) ||
            roomName.includes(query) ||
            teacherMatch
          ) {
            matches.push({
              type: "room",
              building,
              floor: floor?.floor || "Unknown Floor",
              room,
            });
          }
        });
      });
    });

    return matches;
  }, [query]);

  const hasResults = buildingResults.length > 0 || roomResults.length > 0;

  return (
    <div className="rounded-3xl bg-white p-5 shadow">
      <h2 className="mb-2 text-2xl font-bold text-slate-800">
        Search Building / Room / Lab / Teacher Cabin
      </h2>

      <p className="mb-4 text-sm text-slate-600">
        Search by building name, room number, lab, or teacher.
      </p>

      <input
        placeholder="Search building, room no, lab, teacher name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full rounded-xl border p-3 text-black placeholder:text-gray-500"
      />

      {search.trim() && hasResults && (
        <div className="mb-6 space-y-3">
          {buildingResults.map((b) => (
            <div
              key={`building-${b.id}`}
              onClick={() => setSelected(b)}
              className="cursor-pointer rounded-xl border p-3 hover:bg-gray-50"
            >
              <p className="font-semibold text-gray-900">{b.name}</p>
              <p className="text-sm text-gray-600">Building</p>
              <p className="text-xs text-gray-500">
                lat: {b.lat}, lng: {b.lng}
              </p>
            </div>
          ))}

          {roomResults.map((r, i) => (
            <div
              key={`room-${i}`}
              onClick={() => setSelected(r.building)}
              className="cursor-pointer rounded-xl border p-3 hover:bg-gray-50"
            >
              <p className="text-sm font-semibold text-gray-900">
                {r.room?.name || "Unnamed Room"}
              </p>
              <p className="text-sm text-gray-700">
                Room: {r.room?.roomNo || "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                Building: {r.building?.name || "Unknown Building"}
              </p>
              <p className="text-sm text-gray-700">
                Floor: {r.floor || "Unknown Floor"}
              </p>

              {Array.isArray(r.room?.teachers) && r.room.teachers.length > 0 && (
                <p className="text-sm text-gray-700">
                  Teacher: {r.room.teachers.join(", ")}
                </p>
              )}

              <p className="text-sm text-gray-700">
                Direction: {r.room?.direction || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}

      {search.trim() && !hasResults && (
        <div className="mb-6 rounded-xl border border-dashed p-4 text-sm text-gray-600">
          No matching building or room found.
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border">
        <img
          src={campusMap}
          alt="Government Engineering College Ajmer Campus Map"
          className="w-full rounded-xl"
        />

        {locations.map((loc) => {
          const isSelected = selected?.id === loc.id;
          const isSearchMatch =
            query && String(loc?.name || "").toLowerCase().includes(query);

          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => setSelected(loc)}
              className={`absolute rounded-lg px-3 py-2 text-sm font-semibold shadow transition ${
                isSelected
                  ? "bg-green-600 text-white"
                  : isSearchMatch
                  ? "bg-yellow-400 text-black animate-pulse"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              style={{
                top: loc.top,
                left: loc.left,
                transform: "translate(-50%, -50%)",
              }}
            >
              {loc.name}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6 rounded-xl border p-4">
          <h3 className="text-lg font-bold text-slate-900">{selected.name}</h3>

          <div className="mt-2 space-y-1 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Latitude:</span> {selected.lat}
            </p>
            <p>
              <span className="font-semibold">Longitude:</span> {selected.lng}
            </p>
            {selected.description && (
              <p>
                <span className="font-semibold">Info:</span>{" "}
                {selected.description}
              </p>
            )}
          </div>

          {selected?.floors?.length > 0 ? (
            selected.floors.map((f, i) => (
              <div key={i} className="mt-4">
                <h4 className="font-semibold text-slate-800">{f.floor}</h4>

                <div className="mt-2 space-y-1">
                  {f.rooms.map((room, j) => (
                    <div
                      key={j}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <div className="font-medium">
                        {room?.roomNo || "N/A"} - {room?.name || "Unnamed Room"}
                      </div>

                      {Array.isArray(room?.teachers) && room.teachers.length > 0 && (
                        <div>Teacher: {room.teachers.join(", ")}</div>
                      )}

                      <div>Direction: {room?.direction || "N/A"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="mt-4 text-sm text-gray-600">
              No floor/room details available for this building yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}