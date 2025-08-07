import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {PlatformContext} from "./Layout/PlatformLayout.jsx";
import Table from "./Table.jsx";
import Button from "./Button.jsx";

function ApikeySettings() {
    const [apiKey, setApiKey] = useState('');
    const [apiKeyDetails, setApiKeyDetails] = useState(null);
    const [showKey, setShowKey] = useState(false);

    //page header handling
    const platformCtx = useContext(PlatformContext);

    useEffect(() => {
        platformCtx.setPage("API Key Settings");
        platformCtx.setBreadcrumb([
            {name: "Home"},
            {name: "API Key Settings", path: "/apikey-settings"}
        ]);
        fetchApiKeyDetails();
    }, []);

    const fetchApiKeyDetails = async () => {
        try {
            const response = await axios.get('/apikey-settings');
            if (response.data.success) {
                setApiKeyDetails(response.data.apiKeyDetails);
            } else {
                alert('Failed to fetch API key details');
            }
        } catch (error) {
            console.error('Failed to fetch API key details:', error);
        }
    };

    const saveApiKey = async () => {
        try {
            // Check if an API key already exists
            const existingResponse = await axios.get('/apikey-settings');
            if (existingResponse.data.success && existingResponse.data.apiKeyDetails) {
                platformCtx.setAlert({type: "danger", message: 'An API Key already exists in the system. Please delete the existing API Key before adding a new one.'});
                return;
            }

            const response = await axios.post('/apikey-settings', { key: apiKey });
            if (response.data.success) {
                platformCtx.setAlert({type: "success", message: 'API Key saved successfully!'});
                fetchApiKeyDetails();
            } else {
                platformCtx.setAlert({type: "danger", message: 'Failed to save API key'});
            }
        } catch (error) {
            console.error('Failed to save API key:', error);
        }
    };

    const deleteApiKey = async () => {
        try {
            const response = await axios.delete('/apikey-settings');
            if (response.data.success) {
                alert('API Key deleted successfully!');
                setApiKey('');
                setApiKeyDetails(null); // directly update the state
            } else {
                alert('Failed to delete API key');
            }
        } catch (error) {
            console.error('Failed to delete API key:', error);
        }
    };

    const toggleShowKey = () => {
        setShowKey(!showKey);
    };

    return (
        <div className="p-4">
            <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} className="border-2 border-gray-300 p-2 rounded"/>
            <Button onClick={saveApiKey} className="bg-green-500 text-white p-2 rounded ml-2">Save API Key</Button>
            {apiKeyDetails && apiKeyDetails.key && (
                <div style={{marginTop: '20px'}}>
                    <Table
                        simple={true}
                        header={["#", "API Key", "Added At", "Action"]}
                        data={[{
                            key: apiKeyDetails.key,
                            addedAt: apiKeyDetails.addedAt
                        }].map((keyDetail, index) => {
                            return [
                                index + 1,
                                showKey ? keyDetail.key : keyDetail.key.split('').map(char => char === '-' ? '-' : '*').join(''),
                                new Date(keyDetail.addedAt).toLocaleString(),
                                <div key={keyDetail.key} className="flex gap-2">
                                    <button onClick={toggleShowKey} className="text-blue-500 bg-transparent border-none">
                                        <span className="material-icons text-black">visibility</span></button>
                                    <span onClick={deleteApiKey}
                                          className="material-icons text-red-500 cursor-pointer">delete</span>
                                </div>
                            ];
                        })}
                    />
                </div>
            )}
        </div>
    );
}

export default ApikeySettings;