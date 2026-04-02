import { ChevronRight, Search } from "lucide-react";
import React, { useState, useEffect } from "react";
const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = React.useRef(null);

    // إغلاق القائمة عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative w-48" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white flex justify-between items-center focus:ring-2 focus:ring-red-500"
            >
                <span className="truncate">{selectedOption ? selectedOption.label : label}</span>
                <ChevronRight size={16} className={`transform transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 text-gray-400" size={14} />
                            <input
                                type="text"
                                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder={placeholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-height-60 overflow-y-auto max-h-48">
                        <div
                            className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-500"
                            onClick={() => {
                                onChange("");
                                setIsOpen(false);
                                setSearchTerm("");
                            }}
                        >
                            {label} (الكل)
                        </div>
                        {filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                className={`px-3 py-2 text-sm hover:bg-red-50 cursor-pointer ${value === opt.value ? "bg-red-50 text-red-600 font-medium" : ""}`}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                    setSearchTerm("");
                                }}
                            >
                                {opt.label}
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-400 text-center">لا يوجد نتائج</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
