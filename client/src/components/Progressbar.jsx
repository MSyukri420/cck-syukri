    /**
     * Progressbar component.
     * @param {Object} props - The props for the Progressbar component.
     * @param {"primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark"} props.type - The type of the progressbar.
     * @param {number} props.percentage - The percentage of the progressbar.
     */
  function Progressbar({type, percentage}) {
      /**
       * Function to set the progressbar type.
       * @param {string} type - The type of the progressbar.
       * @returns {string} The CSS classes for the progressbar type.
       */
      function setProgressbarType(type) {
          switch(type) {
          case "primary":
              return 'bg-blue-500';
          case "secondary":
              return 'bg-gray-500';
          case "success":
              return 'bg-green-500';
          case "danger":
              return 'bg-red-500';
          case "warning":
              return 'bg-yellow-500';
          case "info":
              return 'bg-blue-300';
          case "light":
              return 'bg-gray-300';
          case "dark":
              return 'bg-gray-900';
          default:
              return 'bg-blue-500';
          }
      }
  
    return (
      <div className="w-full h-4 bg-gray-200 rounded-full">
        {/* Render the progressbar with the appropriate type and percentage */}
        <div className={`h-full ${setProgressbarType(type)} rounded-full`} style={{width: `${percentage}%`}}></div>
      </div>
    );
  }
  
  export default Progressbar;