const mongoose = require("mongoose");
const Attribute = require("../models/Attribute");
const Designation = require("../models/Designation");
const SubAttribute = require("../models/SubAttribute");
const {escapeRegex} = require("../functions");

module.exports = {
    attributes: async (req, res) => {
        try {
            let attributes = await Attribute.find()
                .populate('designation')
                .populate({
                    path: 'designation',
                    populate: {
                        path: 'department',
                        model: 'Department'
                    }
                })
                .populate('subAttributes')
                .lean();
            let designations = await Designation.find().lean();  // Fetching all designations

            return res.json({success: true, attributes, designations});
        } catch(err) {
            console.error('Error fetching attributes:', err.message);

            res.status(500);

            return res.json({success: false, message: 'Server Error'});
        }
    },

    filterAttributes: async (req, res) => {
        try {
            let filter = {};
            if (req.query.category && req.query.category !== 'Select Category') {
                filter.category = req.query.category;
            }
            if (req.query.name) {
                filter.name = new RegExp(escapeRegex(req.query.name), 'i'); // Case-insensitive, literal search
            }
            if (req.query.designation) {
                filter.designation = new mongoose.Types.ObjectId(req.query.designation);
            }

            let attributes = await Attribute.find(filter).populate('designation').lean();

            return res.json({success: true, attributes});
        } catch (err) {
            console.error('Error filtering attributes:', err.message);
            res.status(500);

            return res.json({success: false, message: 'Server Error'});
        }
    },

    getUsedPercentage: async (req, res) => {
        try {
            const { designationId } = req.query;

            // Correctly instantiate ObjectId with 'new'
            const objectId = new mongoose.Types.ObjectId(designationId);

            // Sum up the percentageCarry of all attributes for the given designation
            const totalUsedPercentage = await Attribute.aggregate([
                { $match: { designation: objectId } },
                { $group: { _id: null, total: { $sum: "$percentageCarry" } } }
            ]);

            const usedPercentage = totalUsedPercentage.length > 0 ? totalUsedPercentage[0].total : 0;

            return res.json({ success: true, usedPercentage });
        } catch (err) {
            console.error('Error fetching used percentage:', err.message);
            res.status(500);

            return res.json({success: false, message: 'Server Error'});
        }
    },

    getSubAttributes: async (req, res) => {
        try {
            const attributeId = req.params.id;
            const attribute = await Attribute.findById(attributeId).populate('subAttributes');

            // Check if attribute exists
            if (!attribute) {
                return res.status(404).send('Attribute not found');
            }

            return res.json({success: true, subAttributes: attribute.subAttributes});
        } catch (err) {
            console.error('Error fetching subattributes:', err.message);
            res.status(500);

            return res.json({success: false, message: 'Server Error'});
        }
    },

    editAttribute: async (req, res) => {
        const { id, category, name, percentageCarry, designationId } = req.body;

        try {
            // Check if the designation is valid
            const designation = await Designation.findById(designationId);
            if (!designation) {
                return res.status(400).json({ message: 'Invalid Designation' });
            }

            // Find the attribute by id and update it
            const updatedAttribute = await Attribute.findByIdAndUpdate(id, {
                category,
                name,
                percentageCarry,
                designation: designationId
            }, { new: true });

            return res.json({ message: 'Attribute updated successfully' });
        } catch (err) {
            console.error('Error updating attribute:', err.message);
            res.status(500);

            return res.json({success: false, message: 'Server Error' });
        }
    },

    deleteAttribute: async (req, res) => {
        const { id } = req.body;

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }
        try {
            // Sub-attributes are stored inside the attribute, so one delete removes both. No transaction
            // is needed, which keeps this working on a standalone MongoDB (transactions need a replica set).
            const attribute = await Attribute.findByIdAndDelete(id);

            if (!attribute) {
                return res.status(404).json({ message: 'Attribute not found' });
            }

            // Older data may still have separate SubAttribute documents
            await SubAttribute.deleteMany({ _id: { $in: attribute.subAttributes.map((sub) => sub._id) } });

            return res.json({success: true, message: 'Attribute and Sub-attributes deleted successfully' });
        } catch (err) {
            console.error('Error deleting attribute and subattributes:', err.message);
            res.status(500);

            return res.json({success: false, message: 'Server Error' });
        }
    },
};
