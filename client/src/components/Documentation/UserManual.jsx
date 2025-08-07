import React from 'react';

const UserManual = () => {
    return (
        <div className="user-manual">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">User Manual</h2>
            <p className="text-lg mb-4 text-gray-600">Welcome to the CCK Performance System User Manual!</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>System Requirements</li>
                <li>Getting Started</li>
                <li>Detailed Module Instructions</li>
                <li>Advanced Features and Settings</li>
            </ul>
            {/* Add detailed user manual content here */}
        </div>
    );
};

export default UserManual;
