import {forwardRef, useContext, useEffect, useImperativeHandle, useState} from "react";
import Button from "./Button.jsx";
import {PlatformContext} from "./Layout/PlatformLayout.jsx";

const SearchQuery = forwardRef(function({selections = [], data= [], onSaved, onDelete}, ref) {
    const languageMap = {
        English: {

            select: 'Select'
        },
        'Bahasa Melayu': {

            select: 'Pilih'
        },
        '中文': {

            select: '选择'
        }
    };
    const [searchQueries, setSearchQueries] = useState([])
    const platformCtx = useContext(PlatformContext);
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");

    function handleOnSaved() {
        if(!key || !value) {
            return;
        }

        setSearchQueries([...searchQueries, {key, value}]);
        onSaved?.({key, value});

        // Clear the input fields
        setKey("");
        setValue("");
    }

    function handleOnDelete(index) {
        const newQueries = searchQueries.filter((query, i) => i !== index);
        setSearchQueries(newQueries);
        onDelete?.(index);
    }

    useImperativeHandle(ref, () => ({
        getSearchQueries: () => searchQueries
    }), [searchQueries]);

    useEffect(() => {
        if(data.length > 0) {
            searchQueries.concat(data);
        }
    }, [data]);

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-row gap-4 text-sm">
                {/* Dropdown Button */}
                <select onChange={(e) => setKey(e.target.value)} value={key} className="w-1/6 p-2 ring-1 ring-inset ring-gray-200 rounded-md font-medium focus:outline-none">
                    <option value="" disabled>{languageMap[platformCtx.language].select}</option>
                    {selections.map((selection, index) => (
                        <option key={index} value={selection}>{selection}</option>
                    ))}
                </select>
                {/* Search Input */}
                <input type="text" onKeyUp={(e) => {
                    if (e.key === "Enter") {
                        handleOnSaved();
                    }
                }} value={value} onChange={(e) => setValue(e.target.value)} className="w-3/6 p-2 ring-1 ring-inset ring-gray-200 rounded-md font-medium focus:outline-none"/>
            </div>
            {/* If search input is not empty */}
            {searchQueries.length > 0 && (<div className="flex flex-wrap gap-2 p-4 rounded-md bg-white">
                {searchQueries.map((query, index) => (
                    <div key={index} className="flex flex-row text-xs gap-2 rounded-full bg-red-400 items-center px-2 py-1 text-white">
                        <span>{query.key}:</span>
                        <span>{query.value}</span>
                        <span 
                            className="material-icons text-sm text-white cursor-pointer"
                            onClick={() => handleOnDelete(index)}>
                            close
                        </span>
                    </div>
                ))}
            </div>)}
        </div>
    );
});

export default SearchQuery;