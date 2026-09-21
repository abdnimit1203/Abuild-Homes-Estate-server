const mongoose = require("mongoose");
const Property = require("../models/Property");

/**
 * Helper to assemble a readable location string from granular address parts.
 */
function assembleLocation(data) {
  const parts = [
    data.houseNumber ? `House: ${data.houseNumber}` : "",
    data.roadNumber ? `Road: ${data.roadNumber}` : "",
    data.division,
    data.country,
    data.continent,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : data.propertyLocation || "";
}

/**
 * Retrieves properties with optional filters (status, agentEmail, minPrice sort).
 */
async function getProperties(req, res, next) {
  try {
    const status = req.query.status;
    const email = req.query.email;
    const sort = req.query.sort;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (email) {
      query.agentEmail = email;
    }

    let sortOptions = {};
    if (sort === "asc") {
      sortOptions = { minPrice: 1 };
    } else if (sort === "desc") {
      sortOptions = { minPrice: -1 };
    }

    const propertiesData = await Property.find(query).sort(sortOptions).lean();
    const countData = await Property.countDocuments(query);

    res.send({ propertiesData, countData });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single property by its ID.
 */
async function getPropertyById(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid property ID." });
    }
    const result = await Property.findById(id).lean();
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new property listing with elaborated location support.
 */
async function createProperty(req, res, next) {
  try {
    const propertyData = { ...req.body };

    // Automatically assemble unified propertyLocation if missing
    if (!propertyData.propertyLocation) {
      propertyData.propertyLocation = assembleLocation(propertyData);
    }

    // Ensure minPrice and maxPrice are numbers
    if (propertyData.minPrice !== undefined) {
      propertyData.minPrice = Number(propertyData.minPrice) || 0;
    }
    if (propertyData.maxPrice !== undefined) {
      propertyData.maxPrice = Number(propertyData.maxPrice) || 0;
    }

    const result = await Property.create(propertyData);
    res.send({
      acknowledged: true,
      insertedId: result._id,
      ...result.toObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an existing property by ID with granular location support.
 */
async function updateProperty(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid property ID." });
    }

    const newData = req.body;
    const updateFields = {};

    if (newData.propertyImage !== undefined) updateFields.propertyImage = newData.propertyImage;
    if (newData.propertyTitle !== undefined) updateFields.propertyTitle = newData.propertyTitle;
    if (newData.priceRange !== undefined) updateFields.priceRange = newData.priceRange;
    if (newData.minPrice !== undefined) updateFields.minPrice = Number(newData.minPrice);
    if (newData.maxPrice !== undefined) updateFields.maxPrice = Number(newData.maxPrice);
    if (newData.agentName !== undefined) updateFields.agentName = newData.agentName;

    // Granular location updates
    if (newData.houseNumber !== undefined) updateFields.houseNumber = newData.houseNumber;
    if (newData.roadNumber !== undefined) updateFields.roadNumber = newData.roadNumber;
    if (newData.division !== undefined) updateFields.division = newData.division;
    if (newData.country !== undefined) updateFields.country = newData.country;
    if (newData.continent !== undefined) updateFields.continent = newData.continent;

    // Assembled or explicit propertyLocation
    if (newData.propertyLocation) {
      updateFields.propertyLocation = newData.propertyLocation;
    } else if (
      newData.houseNumber ||
      newData.roadNumber ||
      newData.division ||
      newData.country ||
      newData.continent
    ) {
      updateFields.propertyLocation = assembleLocation(newData);
    }

    const result = await Property.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateFields }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes a property listing by ID.
 */
async function deleteProperty(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid property ID." });
    }
    const result = await Property.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Marks a property as verified (admin action).
 */
async function makeVerified(req, res, next) {
  try {
    const id = req.query.id;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid property ID." });
    }
    const result = await Property.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { status: "verified" } }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Marks a property as rejected (admin action).
 */
async function makeRejected(req, res, next) {
  try {
    const id = req.query.id;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid property ID." });
    }
    const result = await Property.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { status: "rejected" } }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  makeVerified,
  makeRejected,
};
