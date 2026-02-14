import collegeImg from "../assets/college.jpeg";

export default function CollegeBanner() {
    return (
        <section className="mt-10 flex justify-center relative px-6">

            {/* Glow Behind Image */}
            <div className="absolute w-[600px] h-[300px] bg-purple-600/30 blur-[120px] rounded-full -z-10"></div>

            {/* Glass Image Container */}
            <div className="
        w-full max-w-6xl
        rounded-3xl
        overflow-hidden
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        shadow-[0_10px_50px_rgba(139,92,246,0.25)]
      ">

                <img
                    src={collegeImg}
                    alt="College"
                    className="w-full h-[400px] object-cover"
                />

            </div>
        </section>
    );
}
