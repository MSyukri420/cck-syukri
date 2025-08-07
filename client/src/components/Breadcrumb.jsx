import {useEffect, useState} from "react";

/**
 * Breadcrumb component.
 * @param {Object} props - The props object.
 * @param {Object[]} props.path - An array of breadcrumb paths.
 * @param {string} props.path[].name - The name of the breadcrumb.
 * @param {string|null} props.path[].path - The path of the breadcrumb, null if it's the last breadcrumb.
 */
function Breadcrumb({path}) {
    // State to hold the breadcrumbs
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    /**
     * Handle breadcrumb click.
     * @param {string|null} path - The path of the clicked breadcrumb.
     */
    function handleClick(path) {
        if(path === null) {
            return;
        }

        // Log the path of the clicked breadcrumb
        console.log(path);
    }

    // Effect to set the breadcrumbs when the path prop changes
    useEffect(() => {
        setBreadcrumbs(path);
    }, [path]);

    return (
        <div>
            {breadcrumbs.map((breadcrumb, index) => (
                <span key={`breadcrumb-${index}-${breadcrumb.name}`}>
                    {/* Render the breadcrumb name. Make it clickable if it's not the last breadcrumb. */}
                    <span className={`font-medium ${index < breadcrumbs.length - 1? "cursor-pointer" : "text-slate-500"}`} onClick={path? () => handleClick(breadcrumb.path) : undefined}>{breadcrumb.name}</span>
                    {/* Render a slash after the breadcrumb if it's not the last breadcrumb. */}
                    {index < breadcrumbs.length - 1 && <span className="px-2">/</span>}
                </span>
            ))}
        </div>
    )
}

export default Breadcrumb;