import React, { useEffect, useState } from "react";
import { Prize } from "../types/Prize";
import { Participant } from "../types/Participant";
import { WinnerData } from "../types/winnerdata"; // Assuming this is the path for WinnerData
import { FiDownload, FiTrash2 } from "react-icons/fi";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import ExportPage from "../ExportPage/ExportPage";
import ProgressBar from "../components/ProgresssBar";

interface SpinExecutionProps {
  prizes: Prize[]; // Define the prop type
  participants: Participant[];
}

const SpinExecution: React.FC<SpinExecutionProps> = ({
  prizes,
  participants,
}) => {
  const [mutablePrizes, setMutablePrizes] = useState<Prize[]>(prizes);
  const [mutableParticipants, setMutableParticipants] =
    useState<Participant[]>(participants);
  const [spinRate, setSpinrate] = useState<number>(100);
  const [duration, setDuration] = useState<number>(500);
  const [displayedParticipant, setDisplayedParticipant] =
    useState<Participant | null>(null);
  const [winners, setWinners] = useState<WinnerData[]>([]); // New state for winners
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null); // New state for current prize
  const [remainingQty, setRemainingQty] = useState<number>(0); // New state for remaining quantity
  // const [spinCount, setSpinCount] = useState<number>(0); // Track number of spins
  const [spinning, setSpinning] = useState<boolean>(false); // Track number of spins
  const newTab = useRef<Window | null>(null);

  // Calculate the total number of spins needed (total quantity of prizes)
  // const totalSpins = mutablePrizes.reduce((acc, prize) => acc + prize.qty, 0);
  // setSpinCount(totalSpins)

  const handleChangeSpinRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpinrate(Number(e.target.value));
  };

  const handleChangeDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(e.target.value));
  };

  useEffect(() => {
    setMutableParticipants(participants);
  }, [participants]);

  const handleExecuteSpin = async () => {
    const useLastConfig = false;

    //=====================================================================================================================
    if (useLastConfig) {
      const availablePrizes = mutablePrizes.filter((prize) => prize.qty > 0);
      const totalSpins = availablePrizes.reduce(
        (acc, prize) => acc + prize.qty,
        0
      );

      if (spinning) return;

      console.log("Spinning...");
      setSpinning(true); // Set spinning status
      const totalParticipants = mutableParticipants.length;
      const endTime = Date.now() + duration;

      for (let spinCount = 0; spinCount < totalSpins; spinCount++) {
        // Check if the duration has ended
        if (Date.now() >= endTime) {
          // Break out of the loop if the duration is over
          break;
        }

        // Spin logic
        const currentIndex = spinCount % totalParticipants; // Cycle through participants
        setDisplayedParticipant(mutableParticipants[currentIndex]);

        // Wait for the spinRate duration before the next update
        await new Promise((resolve) => setTimeout(resolve, spinRate));
      }

      // After the spinning duration, select a prize and a winner
      if (availablePrizes.length === 0) {
        console.log("No prizes available to spin.");
        setSpinning(false); // Reset spinning status
        return;
      }

      const prizeIndex = Math.floor(Math.random() * availablePrizes.length);
      const prize = availablePrizes[prizeIndex];
      setCurrentPrize(prize); // Set the current prize
      setRemainingQty(prize.qty); // Set the remaining quantity for the current prize

      const finalIndex = Math.floor(Math.random() * totalParticipants);
      const winner = mutableParticipants[finalIndex];

      // Update displayed participant and add to winners
      setDisplayedParticipant(winner);
      setWinners((prevWinners) => [
        ...prevWinners,
        { participant: winner, prize: prize },
      ]);

      // Decrement the quantity of the current prize
      setRemainingQty((prevQty) => (prevQty > 0 ? prevQty - 1 : 0));

      // Optionally, update the mutable prizes if you want to reflect the remaining qty
      setMutablePrizes((prevPrizes) =>
        prevPrizes.map((p) =>
          p.name === prize.name ? { ...p, qty: Math.max(p.qty - 1, 0) } : p
        )
      );

      // End the spin process
      console.log("Total spins completed. Spinning has stopped.");
      setSpinning(false); // Reset spinning status
      return;
    }

    //=====================================================================================================================
    const spinRound = duration / spinRate;
    let availablePrizes = mutablePrizes.filter((prize) => prize.qty > 0);
    // const totalSpins = availablePrizes.reduce(
    //   (acc, prize) => acc + prize.qty,
    //   0
    // );

    let updatedPrizes = [...mutablePrizes];
    while (availablePrizes.length > 0) {
      // Pick a random prize from the available prizes
      const prizeIndex = Math.floor(Math.random() * availablePrizes.length);
      const prizeWon = availablePrizes[prizeIndex];

      //Spin the participant
      //===============================================================================================================
      //Check the up to date participant length
      // Spin Visualizations
      let winnerIndex = 0;

      for (let index = 0; index < spinRound; index++) {
        winnerIndex = Math.floor(Math.random() * mutableParticipants.length);
        setDisplayedParticipant(mutableParticipants[winnerIndex]);
        //Show the prize box

        await new Promise((resolve) => setTimeout(resolve, spinRate));
      }
      //Unveil the prize
      setCurrentPrize(prizeWon);
      setRemainingQty(prizeWon.qty - 1);

      // Spin Winner Pick
      const winner = mutableParticipants[winnerIndex];
      console.log(winner);

      // Delete The Winner in the Participant List to Prevent Duplicate Spins
      mutableParticipants.splice(winnerIndex, 1); // Remove winner from the list directly

      //Tambahkan ke list pemenang dan di local storage
      addWinner(winner, prizeWon);

      // Wait before the next round
      await new Promise((resolve) => setTimeout(resolve, 100));

      //===============================================================================================================

      // Synchronously update the quantity in the temporary array
      updatedPrizes = updatedPrizes.map((p) =>
        p.name === prizeWon.name ? { ...p, qty: Math.max(p.qty - 1, 0) } : p
      );

      // Update availablePrizes based on the latest prize quantities in updatedPrizes
      availablePrizes = updatedPrizes.filter((prize) => prize.qty > 0);

      // Finally, set the updated prizes back to state once the loop is done
      setMutablePrizes(updatedPrizes);
      // Wait for the state to update
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return;
    // for (let prizeIndex = 0; prizeIndex < totalSpins; prizeIndex++) {

    // }
  };

  const addWinner = (winner: Participant, prizeWon: Prize) => {
    setWinners((prevWinners) => {
      const updatedWinners = [
        ...prevWinners,
        { participant: winner, prize: prizeWon },
      ];

      // Update localStorage with the new winners list
      localStorage.setItem("winners", JSON.stringify(updatedWinners));
      return updatedWinners;
    });
  };


  

  const openInNewTab = () => {
    // Open a new tab
    newTab.current = window.open("", "_blank");
  
    if (newTab.current) {
      // Create a placeholder for React to render
      newTab.current.document.body.innerHTML = "<div id='new-tab-root'></div>";
  
      // Inject Tailwind CSS into the new tab
      const tailwindLink = document.createElement("link");
      tailwindLink.rel = "stylesheet";
      tailwindLink.href = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
      newTab.current.document.head.appendChild(tailwindLink);
  
   // Sort the winners data
   const sortedWinners = winners.sort((a, b) => {
    const prizeComparison = a.prize.prizeNumber - b.prize.prizeNumber;
    if (prizeComparison !== 0) return prizeComparison;
    return a.participant.name.localeCompare(b.participant.name);
  });
  
  

  
      // Render the React component in the new tab
      createRoot(newTab.current.document.getElementById("new-tab-root") as HTMLElement).render(
        <ExportPage data={sortedWinners} />
      );
    }
  };
  

  // const closeNewTab = () => {
  //   if (newTab.current) {
  //     newTab.current.close();
  //     newTab.current = null;
  //   }
  // };

  //=====================================================================================================================

  useEffect(() => {
    setMutablePrizes(prizes);
    // Retrieve winners from localStorage if they exist
    const storedWinners = localStorage.getItem("winners");
    if (storedWinners) {
      setWinners(JSON.parse(storedWinners));
    }
  }, [prizes]);

  // const handleExportWinners = () => {
  //   if (winners.length == 0) return;
  //   const userInput = prompt("Ketik EXPORT untuk mengunduh daftar pemenang");
  //   if (userInput === "EXPORT") {
  //     // Export the winners

  //   } else {
  //     alert("Perintah salah, silahkan diulangi kembali");
  //   }
  // };

  const handleExportWinners = () => {
    if (winners.length === 0) return;
    const userInput = prompt("Ketik EXPORT untuk mengunduh daftar pemenang");
    if (userInput === "EXPORT") {
      //export the winners
      openInNewTab();
      return;
      const csvContent = winners
        .map((winner, index) => `${index + 1},${winner.participant.name},${winner.prize}`)
        .join("\n");
      const blob = new Blob([`No,Name,Prize\n${csvContent}`], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "winners.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Perintah salah, silahkan diulangi kembali");
    }
  };

  
  const handleClearWinners = () => {
    if (winners.length == 0) return;
    const userInput = prompt(
      "Ketik HAPUS untuk menghapus daftar pemenang\nNote : Aksi ini tidak dapat dibatalkan!"
    );

    if (userInput === "HAPUS") {
      // Clear the winners list and restore the initial participants back
      setWinners([]);
      setMutableParticipants(participants);
      localStorage.removeItem("winners");
      alert("Daftar pemenang telah dihapus");
    } else {
      alert("Perintah salah, silahkan diulangi kembali");
    }
  };

  return (
    <div className="bg-slate-200 min-h-16 w-full h-screen">
      <div className="title flex items-center justify-center">
        <h1 className="my-10 text-2xl">Undian Langsung</h1>
      </div>
      <div className="mainPanel px-4 mx-2 min-h-[250px] md:h-[250px] md:grid grid-cols-1 md:grid-cols-3 gap-2 items-stretch justify-center border border-solid rounded-lg block">
        <div className="setting w-full h-full bg-red-300 p-4 md:flex items-center justify-center flex-col gap-2 ">
          <div className="spinrate__input w-full">
            <label htmlFor="spin__rate" className="mb-2">
              Spin Rate (milliseconds)
            </label>
            <input
              value={spinRate}
              onChange={handleChangeSpinRate}
              type="number"
              className="spin__rate w-full py-1 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Spin Rate (ms)"
            />
          </div>
          <div className="duration__input w-full">
            <label htmlFor="duration" className="mb-2">
              Duration per Spin (milliseconds)
            </label>
            <input
              value={duration}
              onChange={handleChangeDuration}
              type="number"
              className="duration__input w-full py-1 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Duration per spin (ms)"
            />
          </div>
          <div className="spin__button w-full mt-4">
            <button
              onClick={handleExecuteSpin}
              className="bg-red-600 rounded-lg text-white py-2 px-4 w-full"
            >
              SPIN !!!!
            </button>
          </div>
        </div>

        <div className="display w-full h-full bg-yellow-100 md:flex items-center justify-center">
          <h1 className="text-4xl p-6">
            {displayedParticipant ? displayedParticipant.name : "Ready"}
          </h1>
        </div>

        <div className="current__roll w-full h-full bg-green-200 p-2 md:flex flex-col items-center justify-center">
          <h1 className="mb-4">Sedang Mengundi:</h1>
          <h1 className="text-2xl font-extrabold">
            {currentPrize ? currentPrize.name : "No Prize"}
          </h1>
          <h1 className="text-slate-400">Sisa: {remainingQty} unit</h1>
        </div>
      </div>

      <div className="progressBar py-10 px-10">
      <ProgressBar mutablePrizes={mutablePrizes}/>
      </div>

      <div
        className="w-screen bg-slate-200 flex flex-col md:flex-row mt-10"
        style={{ height: "calc(100vh - 100px)" }}
      >
        <div className="flex-1 flex flex-col items-start justify-center px-4">
          <h2 className="text-xl text-slate-900 ">Prize to Spin</h2>
          <div className="flex-1 flex flex-col items-center justify-start w-full">
            <div className="prize__input w-full">
              <div className="flex flex-col h-[calc(100vh-200px)]">
                <div className="table__menus flex flex-row justify-between"></div>
                <div className="overflow-y-auto mt-2 w-full items-center">
                  <table
                    className="table-fixed"
                    style={{ width: "calc(100% - 24px)" }}
                  >
                    <thead className="w-full bg-slate-400">
                      <tr>
                        <th className="border px-4 py-2 w-1/2">Nama Hadiah</th>
                        <th className="border px-4 py-2 w-1/4">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mutablePrizes.length > 0 ? (
                        mutablePrizes.map((prize, index) => (
                          <tr
                            key={index}
                            className={`cursor-pointer hover:bg-gray-200 ${
                              prize.rounded ? "bg-green-200" : ""
                            }`} // Apply row colors
                          >
                            <td className="border px-4 py-1">{prize.name}</td>
                            <td className="border px-4 py-1">{prize.qty}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="border text-center py-2">
                            No prizes available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-start justify-center">
          <div className="winners__table-header flex flex-row w-full justify-between">
            <h2 className="text-xl text-slate-900">Winners</h2>
            <div className="winners__table-action-button flex space-x-2 mr-8">
              <button
                onClick={handleExportWinners}
                className="winners__export-button bg-green-300 text-white p-2 rounded-full hover:bg-green-600"
                aria-label="Export Winners"
              >
                <FiDownload size={10} />
              </button>

              <button
                onClick={handleClearWinners}
                className="winners__clear-button bg-red-300 text-white p-2 rounded-full hover:bg-red-600"
                aria-label="Clear Winners"
              >
                <FiTrash2 size={10} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-start w-full">
            <div className="winner__input w-full">
              <div className="flex flex-col h-[calc(100vh-200px)]">
                <div className="table__menus flex flex-row justify-between"></div>
                <div className="overflow-y-auto mt-2 w-full items-center">
                <table
  className="table-fixed border-collapse"
  style={{ width: "calc(100% - 24px)" }}
>
  <thead className="bg-slate-400">
    <tr>
      <th className="border sticky bg-slate-400 top-0 px-1 py-2 w-6">
        No
      </th>
      <th className="border sticky bg-slate-400 top-0 px-4 py-2 w-1/6">
        ID
      </th>
      <th className="border sticky bg-slate-400 top-0 px-4 py-2 w-1/4">
        Nama
      </th>
      <th className="border sticky bg-slate-400 top-0 px-4 py-2 w-1/6">
        Group
      </th>
      <th className="border sticky bg-slate-400 top-0 px-4 py-2 w-1/4">
        Hadiah
      </th>
    </tr>
  </thead>
  <tbody>
    {winners.length > 0 ? (
      [...winners].reverse().map((winner, index) => (
        <tr
          key={index}
          className={`border hover:bg-gray-200 ${
            index % 2 === 0 ? "bg-slate-100" : "bg-slate-300"
          }`}
        >
          <td className="border px-1 py-1 text-center w-6">{index + 1}</td>
          <td className="border px-4 py-1 w-1/6">{winner.participant.id}</td>
          <td className="border px-4 py-1 w-1/4">{winner.participant.name}</td>
          <td className="border px-4 py-1 w-1/6">{winner.participant.group}</td>
          <td className="border px-4 py-1 w-1/4">{winner.prize.name}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={5} className="border text-center py-2">
          No winners yet.
        </td>
      </tr>
    )}
  </tbody>
</table>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinExecution;
