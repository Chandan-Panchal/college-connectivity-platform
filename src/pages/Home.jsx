import CollegeBanner from "../components/CollegeBanner";
import FeatureSection from "../components/FeatureSection";

export default function Home() {
    return (
        <div className="pb-16">
            <CollegeBanner />
            <section className="mt-14 flex justify-center px-6">
                <div className="w-full max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-[0_10px_50px_rgba(139,92,246,0.18)] md:p-10">
                    <div className="mb-4 inline-flex rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
                        About ECA
                    </div>
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                        Engineering College, Ajmer
                    </h2>
                    <p className="text-base leading-8 text-white/70 md:text-lg">
                        Engineering College, Ajmer (ECA), established in 1997, is an autonomous government institute
                        situated in Badaliya, Ajmer. With a foundation rooted in innovation and quality, the college
                        fosters a culture of academic excellence and forward-thinking. It aims to provide a vibrant
                        learning environment that blends modern education with practical experience. Known for its
                        commitment to student growth, ECA emphasizes research, hands-on training, and an ecosystem that
                        encourages students to build skills beyond the classroom.
                    </p>
                </div>
            </section>
            <FeatureSection />
        </div>
    );
}
