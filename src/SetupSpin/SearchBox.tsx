import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi'; // Importing icons from react-icons

const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClear = () => {
    setSearchQuery(''); // Clear the search input
  };

  return (
    <div className="relative w-full mb-4"> {/* Relative container for positioning */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" /> {/* Prefix icon */}
      {searchQuery && ( // Show clear button only when there's text
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};


export default SearchBox;