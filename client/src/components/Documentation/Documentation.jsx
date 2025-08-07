import React, { useState } from 'react';
import UserGuide from './UserGuide.jsx';
import UserManual from './UserManual.jsx';

const Documentation = () => {
    const [activeSection, setActiveSection] = useState('guide');

    return (
        <div className="container mx-auto py-10 px-6 flex space-x-8">
            <div className="w-1/4">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">Documentation</h1>
                <nav className="flex flex-col space-y-4">
                    <button 
                        className={`py-3 px-5 text-left rounded-md transition duration-300 ${activeSection === 'guide' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} 
                        onClick={() => setActiveSection('guide')}
                    >
                        User Guide
                    </button>
                    <button 
                        className={`py-3 px-5 text-left rounded-md transition duration-300 ${activeSection === 'manual' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} 
                        onClick={() => setActiveSection('manual')}
                    >
                        User Manual
                    </button>
                </nav>
            </div>
            <div className="w-3/4 p-8 bg-white rounded-lg shadow-lg">
                {activeSection === 'guide' && <UserGuide />}
                {activeSection === 'manual' && <UserManual />}
            </div>
        </div>
    );
};

export default Documentation;
