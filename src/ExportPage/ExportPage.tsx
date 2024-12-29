import React, { useRef } from 'react';
import { WinnerData } from '../types/winnerdata';

const ExportPage: React.FC<{ data: WinnerData[] }> = ({ data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintResults = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.body.innerHTML = `
          <html>
            <head>
              <style>
                /* Hide page header and footer */
                @page {
                  margin: 0; /* Removes the default margin, which includes headers and footers */
                }
                body {
                  margin: 1cm; /* Add custom margin to your content */
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  font-size: 12px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 10px;
                }
                th, td {
                  border: 1px solid #ccc;
                  padding: 6px;
                  text-align: left;
                }
                th {
                  background-color: #e2e8f0;
                  font-size: 11px;
                }
              </style>
            </head>
            <body>
              ${printContents}
            </body>
          </html>
        `;
  
        newWindow.document.close(); // Close the document stream
        newWindow.print(); // Trigger the print dialog
        newWindow.close(); // Close the new tab
      }
    }
  };
  

  return (
    <div className="p-6">
      <div className="headers flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">Winners List</h1>
        <button
          onClick={handlePrintResults}
          className="border border-slate-500 px-4 py-2 rounded-lg hover:bg-slate-200"
        >
          Print
        </button>
      </div>
      <div ref={printRef}>
        <table className="mt-4 border-collapse border border-gray-300 w-full">
          <thead className="bg-slate-300">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Group</th>
              <th className="border border-gray-300 px-4 py-2">Prize</th>
            </tr>
          </thead>
          <tbody>
            {data.map((winner, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{winner.participant.name}</td>
                <td className="border border-gray-300 px-4 py-2">{winner.participant.id}</td>
                <td className="border border-gray-300 px-4 py-2">{winner.participant.group}</td>
                <td className="border border-gray-300 px-4 py-2">{winner.prize.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExportPage;
