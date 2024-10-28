import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { FiSearch, FiX } from "react-icons/fi";
import { MdCached, MdDelete } from "react-icons/md";
import { Prize } from "../types/Prize";
import { Participant } from "../types/Participant";

const generateDummyPrizes = (count: number): Prize[] => {
  const dummyPrizes: Prize[] = [];
  const prizeNames = [
    "Gift Card",
    "Bluetooth Speaker",
    "Smartphone",
    "Headphones",
    "Laptop",
    "Watch",
    "Camera",
    "Book",
    "Backpack",
    "Coffee Maker",
    "Plant",
    "Board Game",
    "Puzzle",
    "Video Game",
    "Subscription Box",
    "Smart Home Device",
    "Kitchen Gadget",
    "Travel Voucher",
    "Fitness Tracker",
    "E-Reader",
    "Portable Charger",
  ];

  for (let i = 0; i < count; i++) {
    const name = prizeNames[i % prizeNames.length];
    const qty = Math.floor(Math.random() * 10) + 1; // Random quantity between 1 and 10
    dummyPrizes.push({ name: name, qty: qty, rounded: false });
  }

  return dummyPrizes;
};


interface SetupSpinProps {
  scrollToSpinRef: React.RefObject<HTMLDivElement>;
  setPrizesCallback: (newPrizes: Prize[]) => void;
  setParticipantsCallback: (newParticipants: Participant[]) => void;
}


const SetupSpin: React.FC<SetupSpinProps> = ({ scrollToSpinRef, setPrizesCallback, setParticipantsCallback }) => {
  const handleScrollToSpin = () => {
    scrollToSpinRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notFound, setNotFound] = useState<boolean>(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [prizesToSpin, setPrizesToSpin] = useState<Prize[]>([]);
  const [prizeName, setPrizeName] = useState<string>("");
  const [prizeQty, setPrizeQty] = useState<number>(0);

  useEffect(() => {
    // Retrieve prizes from localStorage
    const storedPrizes = localStorage.getItem("prizes");
    if (storedPrizes) {
      setPrizes(JSON.parse(storedPrizes)); // Parse and set the prizes state
    }
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target!.result as ArrayBuffer);
        if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<Participant>(firstSheet, {
            header: 1,
          });
          const participantsData = json.slice(1).map((row) => ({
            id: row[0],
            name: row[1],
            group: row[2],
          }));
          setParticipants(participantsData);
          setParticipantsCallback(participantsData);
        } else if (file.type === "text/csv") {
          Papa.parse(file, {
            complete: (results) => {
              const participantsData = results.data
                .slice(1)
                .map((row: any[]) => ({
                  id: row[0],
                  name: row[1],
                  group: row[2],
                }));
              setParticipants(participantsData);
            },
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const dropzoneOptions = {
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/csv": [".csv"],
    },
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneOptions);

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.id.toString().includes(searchQuery)
  );

  React.useEffect(() => {
    if (searchQuery === "") {
      setNotFound(false);
    } else {
      setNotFound(filteredParticipants.length === 0);
    }
  }, [searchQuery, filteredParticipants]);

  const renderDataTable = () => {
    const dataToDisplay =
      notFound && searchQuery !== "" ? participants : filteredParticipants;
    return (
      <div>
        <h1 className="text-2xl font-bold">Data Peserta</h1>
        <div className="relative mt-8">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <FiX />
            </button>
          )}
        </div>
        {notFound && searchQuery !== "" && (
          <p className="text-red-500 mb-2">Not Found</p>
        )}
        <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
          <table
            className="min-w-full mt-2 w-1/2"
            style={{ tableLayout: "fixed" }}
          >
            <thead className="bg-gray-200">
              <tr>
                <th className="border-b sticky top-0 z-10 px-2 py-2 bg-slate-400">
                  ID
                </th>
                <th className="border-b sticky top-0 z-10 px-4 py-2 bg-slate-400">
                  Name
                </th>
                <th className="border-b sticky top-0 z-10 px-2 py-2 bg-slate-400">
                  Group
                </th>
              </tr>
            </thead>
            <tbody>
              {dataToDisplay.map((participant, index) => (
                <tr key={index}>
                  <td className="border-b px-2 py-2">{participant.id}</td>
                  <td className="border-b px-4 py-2">{participant.name}</td>
                  <td className="border-b px-2 py-2">{participant.group}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrizeName(e.target.value);
  };
  const handleChangeQty = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrizeQty(Number(e.target.value));
  };

  const spinUpRef = useRef<HTMLDivElement | null>(null);

  const handleSpin = (prize: Prize) => {
    // Logic to spin or select this prize
    if (participants.length <= 0) {
      alert("Tabel peserta belum diinput");
      return;
    }
    spinUpRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeletePrize = (index: number) => {
    setPrizes((prevPrizes) => {
      const updatedPrizes = prevPrizes.filter((_, i) => i !== index);
  
      // Update the local storage with the updated list
      localStorage.setItem("prizes", JSON.stringify(updatedPrizes));
  
      return updatedPrizes;
    });
  };
  

  const addPrize = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  
    if (!prizeName || prizeName.trim() === "" || prizeQty <= 0) {
      return;
    }
  
    setPrizes((prevPrizes) => {
      const updatedPrizes = [
        ...prevPrizes,
        { name: prizeName, qty: prizeQty, rounded: false },
      ];
  
      // Save the updated prizes to local storage
      localStorage.setItem("prizes", JSON.stringify(updatedPrizes));
  
      return updatedPrizes;
    });
  
    // Reset the input fields
    setPrizeName("");
    setPrizeQty(0);
  };
  

  const toggleRounded = (index: number) => {
    setPrizes((prevList) => {
      const updatedList = prevList.map((prize, idx) =>
        idx === index ? { ...prize, rounded: !prize.rounded } : prize
      );
  
      // Save the updated list to local storage
      localStorage.setItem('prizes', JSON.stringify(updatedList));
  
      return updatedList;
    });
  };
  

  const handleMarkAll = () => {
    const allRounded = prizes.every((prize) => prize.rounded); // Check if all are rounded
    // Toggle the 'rounded' property for all prizes
  const updatedPrizes = prizes.map((prize) => ({
    ...prize,
    rounded: !allRounded,
  }));

  // Update the state
  setPrizes(updatedPrizes);

  // Store the updated list in local storage
  localStorage.setItem('prizes', JSON.stringify(updatedPrizes));
  };

  const handleClearAll = () => {
    setPrizes([])
    localStorage.removeItem('prizes');
  };

  const handleBatchSpin = () => {
    if (participants.length <= 0) {
      alert("Tabel peserta belum diinput");
      return;
    }
    handleScrollToSpin();
    // Implement batch spin logic here
    // setPrizesToSpin([]);
    const prizesSpin = prizes.filter((prize) => prize.rounded);
    console.log(prizesSpin);
    

    if (prizesSpin.length > 0) {
      // Implement your batch spin logic here
      console.log("Batch spinning:", prizesSpin);

      // Example: clear the rounded property for spun prizes
      setPrizesToSpin(prizesSpin);

      setPrizesCallback(prizesSpin);
      // console.log(prizesToSpin);
    } else {
      console.log("No prizes to spin.");
    }
  };

  const isBatchSpinEnabled = prizes.some((prize) => prize.rounded);

  return (
    <div>
      <div>
        <div className="w-screen  bg-slate-100 flex flex-col md:flex-row p-4 gap-4">
          <div
            className={`flex-1 flex items-center ${
              participants.length > 0 ? "justify-start" : "justify-center"
            } flex-col`}
          >
            {participants.length === 0 && (
              <div className="description__container">
                <div className="description text-center p-10">
                  <h1 className="text-2xl ">Input Data Peserta</h1>
                  <p>
                    Masukkan data peserta berupa file .xlsx atau .csv terdiri
                    dari 3 kolom :<br />
                    ID, Nama dan Group
                  </p>
                </div>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center ${
                    isDragActive ? "border-green-500" : "border-slate-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <h2 className="text-xl text-slate-900">
                    Drag & Drop files here
                  </h2>
                  {isDragActive ? (
                    <p className="text-slate-600">Drop the files here ...</p>
                  ) : (
                    <p className="text-slate-600">
                      Only .xlsx or .csv files will be accepted
                    </p>
                  )}
                </div>
              </div>
            )}

            {participants.length > 0 && renderDataTable()}
          </div>

          <div className="my-10 separator md:w-1px bg-slate-300" />

          <div className="flex-1 flex flex-col items-start justify-start align-top bg-slate-100 w-full">
            <h1 className="text-2xl">Input Data Hadiah</h1>
            <div className="prize__input mt-8">
              <div className="data__hadiah flex flex-col md:flex-row gap-2">
                <input
                  value={prizeName}
                  onChange={handleChangeName}
                  className="w-full py-0 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama Hadiah"
                />
                <div className="responsive__input flex w-full gap-4">
                  <input
                    value={prizeQty!}
                    onChange={handleChangeQty}
                    className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Qty"
                    type="number"
                  />
                  <button
                    onClick={addPrize}
                    className="rounded-lg py-2 px-10 text-slate-900 bg-slate-200 border-slate-700 z-10"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Prize Display Table */}
              <div className="mt-2 flex flex-col h-[calc(100vh-200px)]">
                <div className="table__menus flex flex-row justify-between">
                 
                  
                </div>
                <div className="overflow-y-auto flex-grow ">
                  <table className="w-full h-1/4">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border sticky top-0 z-10 bg-slate-400 px-4 py-2">
                          No
                        </th>
                        <th className="border sticky top-0 z-10 bg-slate-400 px-4 py-2">
                          Nama Hadiah
                        </th>
                        <th className="border sticky top-0 z-10 bg-slate-400 px-4 py-2">
                          Qty
                        </th>
                        <th className="border sticky top-0 z-10 bg-slate-400 px-4 py-2">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prizes.map((prize, index) => (
                        <tr
                          key={index}
                          onClick={() => toggleRounded(index)} // Toggle rounded on row click
                          className={`cursor-pointer hover:bg-gray-200 ${
                            prize.rounded ? "bg-green-200" : ""
                          }`} // Apply row colors
                        >
                          <td className="border px-4 py-1">{index + 1}</td>
                          <td className="border px-4 py-1">{prize.name}</td>
                          <td className="border px-4 py-1">{prize.qty}</td>
                          <td className="border px-4 py-1 flex items-center justify-center">
                            {/* Spin icon button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSpin(prize);
                              }} // Prevent row click event
                              className="mr-2 p-2 bg-blue-400 text-white rounded hover:bg-blue-500"
                              aria-label="Spin"
                            >
                              <MdCached className="w-5 h-5" />
                            </button>
                            {/* Delete icon button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePrize(index);
                              }} // Prevent row click event
                              className="p-2 bg-red-400 text-white rounded hover:bg-red-500"
                              aria-label="Delete"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="buttons flex flex-row items-center gap-2 justify-end mt-2">
                <button
                    onClick={handleMarkAll}
                    className=" bg-green-300 rounded-lg text-white py-2 px-4 w-full"
                  >
                    Tandai Semua
                  </button>
                  <button
                    onClick={handleClearAll}
                    className=" bg-red-300 rounded-lg text-white py-2 px-4 w-full"
                  >
                    Hapus Semua
                  </button>
                <button
                  onClick={handleBatchSpin}
                  className={` w-full text-white rounded-lg py-2 px-4 ${
                    isBatchSpinEnabled
                      ? "bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isBatchSpinEnabled} // Disable button if no rounded prize
                >
                  Batch Spin
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SetupSpin;
