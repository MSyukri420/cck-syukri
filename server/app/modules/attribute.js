const mongoose = require("mongoose");
const Attribute = require("../models/Attribute");
const Designation = require("../models/Designation");
const SubAttribute = require("../models/SubAttribute");

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
                filter.name = new RegExp(req.query.name, 'i'); // Case-insensitive search
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

    addAttribute: async (req, res) => {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const { category, name, percentageCarry, designationId, subattributeName, subattributeWeight } = req.body;

            const designation = await Designation.findById(designationId);
            if (!designation) {
                throw new Error('Invalid Designation');
            }

            // Validate total percentage for main attributes
            const existingAttributes = await Attribute.find({ category, designation: designationId });
            let totalUsedPercentage = existingAttributes.reduce((acc, attr) => acc + attr.percentageCarry, 0);
            let newAttributePercentage = parseInt(percentageCarry) || 0;

            if (totalUsedPercentage + newAttributePercentage > 100) {
                throw new Error('Total percentage for main attributes exceeds 100%');
            }

            // Create new attribute
            let newAttribute = new Attribute({
                category,
                name,
                percentageCarry: newAttributePercentage,
                designation: designationId,
                subAttributes: []
            });

            // Validate and create subattributes
            let totalSubAttributeWeight = 0;
            let subAttributeIds = [];
            if (Array.isArray(subattributeName) && Array.isArray(subattributeWeight)) {
                for (let i = 0; i < subattributeName.length; i++) {
                    let weight = parseInt(subattributeWeight[i]) || 0;
                    totalSubAttributeWeight += weight;
                    if (totalSubAttributeWeight > 100) {
                        throw new Error('Total weight for subattributes exceeds 100%');
                    }

                    if (subattributeName[i] && weight) {
                        let newSubAttribute = new SubAttribute({
                            name: subattributeName[i],
                            weight,
                            designation: designationId,
                            attribute: newAttribute._id
                        });
                        await newSubAttribute.save({ session });
                        subAttributeIds.push(newSubAttribute._id);
                    }
                }
            }

            newAttribute.subAttributes = subAttributeIds;
            await newAttribute.save({ session });
      
            await session.commitTransaction();

            return res.json({ message: 'Attribute and Sub-attributes added successfully' });
        } catch (err) {
            console.error('Error saving attribute and subattributes:', err.message);
            if (session.inTransaction()) {
                await session.abortTransaction();
            }

            res.status(500);

            return res.json({success: false, message: 'Server Error' });
        } finally {
            session.endSession();
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
            // Start a session to execute a transaction
            const session = await mongoose.startSession();
            session.startTransaction();

            // Find the attribute and its subattributes
            const attribute = await Attribute.findById(id);

            if (!attribute) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: 'Attribute not found' });
            }

            // Remove all subattributes associated with this attribute
            await SubAttribute.deleteMany({ _id: { $in: attribute.subAttributes } }, { session });

            // Now remove the attribute itself
            await Attribute.findByIdAndRemove(id, { session });

            // Commit the transaction
            await session.commitTransaction();

            // End the session
            session.endSession();

            return res.json({success: true, message: 'Attribute and Sub-attributes deleted successfully' });
        } catch (err) {
            console.error('Error deleting attribute and subattributes:', err.message);
            if (session && session.inTransaction()) {
                await session.abortTransaction();
            }

            if (session) {
                session.endSession();
            }

            res.status(500);

            return res.json({success: false, message: 'Server Error' });
        }
    },
};
