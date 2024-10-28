import { useState, useRef, useEffect } from "react";
import "./App.css";
import SetupSpin from "./SetupSpin/SetupSpin";
import SpinExecution from "./SpinExecution/SpinExecution";
import bgMain from './assets/bg-main.png';
import logoicon from './assets/logoicon.svg';
import { Prize } from "./types/Prize";
import { Participant } from "./types/Participant";

function App() {
  const [showHeader, setShowHeader] = useState(true);
  const setUpRef = useRef<HTMLDivElement | null>(null);
  const spinUpRef = useRef<HTMLDivElement | null>(null);
  const [prizesToSpin, setPrizesToSpin] = useState<Prize[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const handleClick = () => {
    setUpRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setShowHeader(currentScrollY === 0);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // New handler for updating prizes
  const updatePrizes = (newPrizes: Prize[]) => {
    // Alter every item's `rounded` property to false
    const updatedPrizes = newPrizes.map((prize) => ({
      ...prize,
      rounded: false, // Set rounded to false
    }));
  
    console.log("Updating prizes:", updatedPrizes); // Example logging
    setPrizesToSpin(updatedPrizes); // Update state with modified prizes
  };

  const updateParticipants = (newPrizes: Participant[]) => {
    // Alter every item's `rounded` property to false
    const updatedParticipants = newPrizes.map((prize) => ({
      ...prize,
    }));
  
    console.log("Updating participants:", updatedParticipants); // Example logging
    setParticipants(updatedParticipants); // Update state with modified prizes
  };
  

  return (
    <>
      <header className={`header w-full h-16 z-10 fixed bg-transparent flex items-center ${showHeader ? '' : 'hidden'}`}>
        <img src={logoicon} className="h-8 pl-2" alt="Logo" />
      </header>

      <section
        className="welcome__section min-h-screen w-full flex flex-col items-center justify-center relative pt-16"
        style={{
          backgroundImage: `url(${bgMain})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <h1 className="text-3xl text-slate-900 text-center md:text-md z-10">
          Welcome to the eLottery Web
        </h1>
        <div className="subtitle w-3/4 text-center mt-6 z-10">
          <p className="text-md text-slate-900">
            Hadirkan kemeriahan dalam setiap acara dengan sistem undian yang
            modern, cepat, dan transparan. Nikmati kemudahan mengelola dan
            mengikuti undian hadiah, serta jadikan setiap momen
            istimewa lebih seru dan berkesan. Temukan pengalaman baru dalam
            pemberian hadiah yang praktis dan profesional!
          </p>
        </div>
        <button
          className="mt-8 rounded-lg bg-white bg-opacity-30 backdrop-blur-lg border border-white border-opacity-20 hover:bg-opacity-40 transition-all py-3 px-16 text-slate-900 shadow-lg z-10"
          onClick={handleClick}
        >
          Mulai
        </button>
      </section>

      <section className="set__up" ref={setUpRef}>
      <SetupSpin scrollToSpinRef={spinUpRef} setPrizesCallback={updatePrizes}  setParticipantsCallback={updateParticipants}/>
      </section>
      <section className="execution" ref={spinUpRef}>
        <SpinExecution prizes={prizesToSpin} participants={participants}/>
      </section>
    </>
  );
}

export default App;
