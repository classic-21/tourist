
import { ButtonComponent } from "@/components/Button";


export default function HomePage() {
  return (
    // Main Container
    <div className="relative h-full">
      {/* background image and gradient containers */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/homepage.jpeg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-transparent to-35%"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/30 to-10%"></div>
      </div>

      {/* Main Body */}
      <div className="relative z-10 flex flex-col justify-between items-center pt-[30%] pb-7 h-full">
        <div className="text-white text-center text-2xl font-bold w-80">
          Explore Uttar Pradesh through audio!
        </div>
        <div className="flex flex-col items-center justify-center w-full gap-5">
          <ButtonComponent
            link="getStarted"
            text="Get Started"
            css="bg-white text-[#8E170D]"
          />
          <ButtonComponent
            link="login"
            text="Login"
            css="bg-[rgba(255,255,255,0.32)] backdrop-blur-[4.4px] text-white"
          />
        </div>
      </div>
    </div>
  );
}
