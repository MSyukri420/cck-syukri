import React, { useEffect } from "react";

/**
 * Tab component.
 * @param {string[]} tabs - The array of tab names.
 * @param {number} activeTabIndex - The index of the active tab.
 * @param {(index: number) => void} [onChange] - The function to call when the active tab changes.
 * @param {React.ReactNode[]} body - The array of content for each tab.
 */
function Tab({ tabs, onChange, activeTabIndex, body }) {
  // State to hold the index of the active tab
  const [activeTab, setActiveTab] = React.useState(0);

  useEffect(() => {
    setActiveTab(activeTabIndex);
  }, [tabs.length]);

  // Effect to update the active tab when the activeTabIndex prop changes
  useEffect(() => {
    setActiveTab(activeTabIndex);
  }, [activeTabIndex]);

  /**
   * Handle click event on a tab.
   * @param {number} index - The index of the clicked tab.
   */
  function handleTabClick(index) {
    setActiveTab(index);
    onChange?.(index);
  }

  return (
    <div className="flex flex-col">
        <ul className="py-3 flex flex-wrap justify-start gap-3 text-sm font-medium">
          {/* Render the tabs */}
          {tabs.map((tab, index) => (
              <li key={index}>
                <a
                  href="#"
                  className={`inline-block w-22 p-3 rounded-t-md 
                    ${
                      activeTab === index
                      ? "bg-red-500 bg-opacity-80 text-white"
                      : "text-gray-500 text-opacity-80 hover:bg-gray-100 hover:bg-opacity-80"
                    }`
                  }
                  onClick={() => handleTabClick(index)}
                >
                {tab}
                </a>
              </li>
          ))}
        </ul>
        <div className="w-full">
            {/* Render the content for each tab. Only the content for the active tab is shown */}
            {body.map((content, index) => (
              <div key={index} className={`${activeTab === index ? "" : "hidden"} flex flex-col w-full overflow-y-auto`}>
                {content}
              </div>
            ))}
        </div>
    </div>
  );
}

export default Tab;