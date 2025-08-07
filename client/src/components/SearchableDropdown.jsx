import {useEffect, useRef, useState} from "react";

function SearchableDropdown({options, selected = "", placeholder, onChange}) {
    const [selectedOptionValue, setSelectedOptionValue] = useState(selected);
    const [showOptions, setShowOptions] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const dropdownRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSearchQuery(selectedOptionValue? lookupOption(selectedOptionValue).text : "");
                setShowOptions(false);
                setSearchMode(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, []);

    function lookupOption(value) {
        if (!value) return {text: placeholder, value: ""};
        return options.find((option) => option.value === value);
    }

    function handleShowOptions() {
        setShowOptions(true);
        setSearchMode(true);

    }

    function handleSelectOption(option) {
        setSelectedOptionValue(option.value);
        setSearchQuery(option.text);
        setShowOptions(false);
        setSearchMode(false);
        onChange?.(option.value);
    }

    function handleSearch(event) {
        setSearchQuery(event.target.value);
    }

    const filteredOptions = options.filter((option) => option.text && option.text.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col relative" ref={dropdownRef}>
            <div className="flex flex-row bg-white p-2 rounded-md border focus-within:ring-2 focus-within:ring-blue-500 shadow-sm" onClick={handleShowOptions}>
                <input type="text" className="w-full bg-transparent outline-none text-sm" value={searchMode? searchQuery : lookupOption(selectedOptionValue).text} onChange={handleSearch}/>
                <span className="material-icons cursor-pointer">{showOptions ? "keyboard_arrow_up" : "keyboard_arrow_down"}</span>
            </div>
            <div
                className="absolute flex flex-col top-12 w-full z-[99] bg-white border rounded-md aria-hidden:invisible text-sm"
                aria-hidden={!showOptions}>
                <p className="text-slate-700 p-2">{placeholder}</p>
                {filteredOptions.map((option) => (
                    <p key={option.value} className="p-4 cursor-pointer hover:bg-gray-100"
                       onClick={() => handleSelectOption(option)}>
                        {option.text}
                    </p>
                ))}
            </div>
        </div>
    )
}

export default SearchableDropdown;