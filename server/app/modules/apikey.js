const ApiKey = require('../models/ApiKey');

module.exports = {
    settings: async (req, res, next) => {
        try {
            if (req.method === 'GET') {
                const apiKey = await ApiKey.findOne();
                if (!apiKey) {
                    return res.status(404).json({ success: false, message: 'API Key not found' });
                }
                res.json({ success: true, apiKeyDetails: { key: apiKey.key, addedAt: apiKey.createdAt } });
            } else if (req.method === 'POST') {
                const newKey = req.body.key;
                let apiKey = await ApiKey.findOne();
                if (apiKey) {
                    apiKey.key = newKey;
                } else {
                    apiKey = new ApiKey({ key: newKey });
                }
                await apiKey.save();
                res.json({ success: true, message: 'API Key saved successfully!' });
            } else if (req.method === 'DELETE') {
                let apiKey = await ApiKey.findOne();
                if (apiKey) {
                    await ApiKey.deleteOne({ _id: apiKey._id });
                    res.json({ success: true, message: 'API Key deleted successfully!' });
                } else {
                    res.status(404).json({ success: false, message: 'API Key not found' });
                }
            } else {
                next();
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },
};