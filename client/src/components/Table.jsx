import React, {useState, useEffect, useImperativeHandle, forwardRef, useCallback,useContext} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {PlatformContext} from "./Layout/PlatformLayout.jsx";

const Table = forwardRef(({header, data, order = "asc", simple}, ref) => {
    const [headers, setHeaders] = useState([]);
    const [sortOrder, setSortOrder] = useState(order);
    const [sortColumn, setSortColumn] = useState("");
    const [sortedData, setSortedData] = useState([]);
    const [showCount, setShowCount] = useState(simple ? 9999 : 10);
    const [currentPage, setCurrentPage] = useState(1);
    const platformCtx = useContext(PlatformContext);

    const languageMap = {
        'English': {
            page: 'Page',
            prev: 'Prev',
            next: 'Next',
            show: 'Show',
            entries: 'entries'
        },
        'Bahasa Melayu': {
            page: 'Halaman',
            prev: 'Sebelum',
            next: 'Seterusnya',
            show: 'Tunjukkan',
            entries: 'entri'
        },
        '中文': {
            page: '页',
            prev: '上一页',
            next: '下一页',
            show: '显示',
            entries: '条目',
        }
    }

    const [items, setItems] = useState(data);
    const [searchActive, setSearchActive] = useState(false);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleNextPage = useCallback(() => {
        setCurrentPage((prev) => prev + 1);
    }, []);

    const handlePrevPage = useCallback(() => {
        setCurrentPage((prev) => prev - 1);
    }, []);

    const handleCountChange = useCallback((count) => {
        setShowCount(count);
    }, []);

    const sortData = useCallback(() => {
        // Get the index of the sort column
        const index = headers.findIndex((header) => header === sortColumn);

        // Create a new copy of the data array
        const dataCopy = items.slice();

        return dataCopy.sort((a, b) => {
            let aData = a[index];
            let bData = b[index];

            if (React.isValidElement(aData)) {
                const markup = renderToStaticMarkup(aData);
                const parser = new DOMParser();
                const doc = parser.parseFromString(markup, 'text/html');
                aData = doc.body.textContent || "";
            }

            if (React.isValidElement(bData)) {
                const markup = renderToStaticMarkup(bData);
                const parser = new DOMParser();
                const doc = parser.parseFromString(markup, 'text/html');
                bData = doc.body.textContent || "";
            }

            if (sortOrder === "asc") {
                if (typeof aData === "string") {
                    return aData.localeCompare(bData);
                } else if (typeof aData === "number") {
                    return aData - bData;
                } else {
                    return 0;
                }
            } else {
                if (typeof aData === "string") {
                    return bData.localeCompare(aData);
                } else if (typeof aData === "number") {
                    return bData - aData;
                } else {
                    return 0;
                }
            }
        });
    }, [data, headers, sortColumn, sortOrder]);

    const handleSort = useCallback((headerName) => {
        if (!headerName || data.length === 0) return;

        if (sortColumn === headerName) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(headerName);
        }
    }, [data.length, sortColumn, sortOrder]);

    useImperativeHandle(ref, () => ({
        reset: () => {
            setSortColumn(headers[0]);
            setSortOrder("asc");
            setItems(data);
            setShowCount(simple ? 9999 : 10);
            setCurrentPage(1);
        },
        search: (headerName, searchValue, caseSensitive = false) => {
            // Get the index of the header
            const index = headers.findIndex((header) => header === headerName);

            setSearchActive(true);

            // Filter the data based on the search value
            if (searchValue && searchValue.length > 0) {
                setItems(data.filter((row) => {
                    let rowData = row[index];
                    if (React.isValidElement(rowData)) {
                        const markup = renderToStaticMarkup(rowData);
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(markup, 'text/html');
                        rowData = doc.body.textContent || "";
                    }
                    if (caseSensitive) {
                        return rowData.includes(searchValue);
                    } else {
                        return rowData.toLowerCase().includes(searchValue.toLowerCase());
                    }
                }));
            }
        },
        searchMultiple: (queryString) => {
            // Format will be key:value comma separated.
            let queries = queryString.split(",");

            setSearchActive(true);

            // Trim trailing and leading white space, then process into
            queries = queries.map((query) => {
                const [key, value] = query.trim().split(":");

                return {key: key.toLowerCase(), value: value.toLowerCase()};
            });

            // Filter data based on all queries
            setItems(data.filter((row) => {
                return queries.every(({key, value}) => {
                    const index = headers.findIndex((header) => header.toLowerCase() === key.toLowerCase());

                    let rowData = row[index];
                    if (React.isValidElement(rowData)) {
                        const markup = renderToStaticMarkup(rowData);
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(markup, 'text/html');
                        rowData = doc.body.textContent || "";
                    }
                    return rowData.toLowerCase().includes(value);
                });
            }));
        }
    }));

    useEffect(() => {
        setHeaders(() => header);

        // Set sort column to the first column
        setSortColumn(header[0]);

        // Sort data by the first column, automatically identify the type of data
        setSortedData(() => sortData());
    }, [data.length, headers.length]);

    useEffect(() => {
        if (data.length > 0 && !searchActive) {
            setItems(data);
        }
    }, [data.length, searchActive]);

    useEffect(() => {
        setSortedData(() => sortData());
    }, [sortOrder, sortColumn, sortData]);

    return (
        <div className="flex flex-col gap-4 pb-4">
            {!simple && <div className="flex flex-row gap-4">
                <p>{languageMap[platformCtx.language].show}</p>
                <select onChange={(e) => handleCountChange(parseInt(e.target.value))}
                        className="border rounded px-2 py-1" defaultValue={10}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <p>{languageMap[platformCtx.language].entries}</p>
            </div>}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-700">
                    <thead className="text-xs uppercase bg-gray-300 text-black">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={`header-${index}`} onClick={() => handleSort(header)}
                                scope={"col"}
                                className="cursor-pointer px-6 py-3">
                                <div className="flex flex-row gap-2 items-center">
                                    <p>{header}</p>
                                    {sortColumn === header && (<span
                                        className="material-icons">{sortOrder === "asc" ? "arrow_drop_down" : "arrow_drop_up"}</span>)}
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {sortedData.length === 0 && (
                        <tr>
                            <td colSpan={headers.length} className="text-center py-4">
                                {platformCtx.language === 'English' && `No data available`}
                                {platformCtx.language === 'Bahasa Melayu' && `Tiada data tersedia`}
                                {platformCtx.language === '中文' && `没有可用的数据`}
                            </td>
                        </tr>)}
                    {sortedData.length > 0 && sortedData.map((row, index) => (
                        // Depending on page number, show the data
                        (index >= (currentPage - 1) * showCount && index < currentPage * showCount) && (<tr
                            key={`row-${index}`}
                            className="odd:bg-white even:bg-slate-200 border-b"
                        >
                            {row.map((data, index) => {
                                return (
                                    <td key={`data-${index}`} className="px-6 py-3">{data}</td>
                                )
                            })}
                        </tr>)
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-row items-center justify-between">
                <p className="text-sm">
                    {platformCtx.language === 'English' && `Showing ${Math.min((currentPage - 1) * showCount + 1, sortedData.length)} to ${Math.min(currentPage * showCount, sortedData.length)} of ${sortedData.length} entries`}
                    {platformCtx.language === 'Bahasa Melayu' && `Menunjukkan ${Math.min((currentPage - 1) * showCount + 1, sortedData.length)} hingga ${Math.min(currentPage * showCount, sortedData.length)} daripada ${sortedData.length} entri`}
                    {platformCtx.language === '中文' && `显示 ${Math.min((currentPage - 1) * showCount + 1, sortedData.length)} 到 ${Math.min(currentPage * showCount, sortedData.length)} 的 ${sortedData.length} 条目`}
                </p>
                {!simple && (<div className="flex flex-row items-center">
                    <div className="flex flex-row gap-4 items-center mr-4">
                        <p>{languageMap[platformCtx.language].page}</p>
                        <select onChange={(e) => handlePageChange(parseInt(e.target.value))}
                                className="border rounded px-2 py-1" value={currentPage}>
                            {data.length > 0 ? Array(Math.ceil(sortedData.length / showCount)).fill(0).map((_, index) => (
                                <option key={`page-${index}`} value={index + 1}>
                                    {index + 1}
                                </option>
                            )) : <option value={1}>1</option>}
                        </select>
                    </div>
                    <button onClick={currentPage === 1 ? undefined : handlePrevPage}
                            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-500 bg-opacity-80 rounded-s">
                        <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M13 5H1m0 0 4 4M1 5l4-4"/>
                        </svg>
                        {languageMap[platformCtx.language].prev}
                    </button>
                    <button
                        onClick={(Math.ceil(sortedData.length / showCount) === currentPage) ? undefined : handleNextPage}
                        className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-500 bg-opacity-80 border-0 border-s border-white rounded-e">
                        {languageMap[platformCtx.language].next}
                        <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </button>
                </div>)}
            </div>
        </div>
    );
});

export default Table;
