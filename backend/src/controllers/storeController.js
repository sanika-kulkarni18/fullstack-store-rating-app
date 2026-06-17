const prisma = require('../db');

// Get all stores with overall rating and current user's rating
const getStoresForUser = async (req, res) => {
  try {
    const { name, address, sortBy, sortOrder } = req.query;
    const userId = req.user.id;

    // Fetch all stores with their ratings
    const stores = await prisma.store.findMany({
      include: {
        ratings: true
      }
    });

    let storeList = stores.map(store => {
      const ratings = store.ratings;
      let overallRating = 0;
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        overallRating = parseFloat((sum / ratings.length).toFixed(2));
      }

      // Find if this user submitted a rating
      const userRatingObj = ratings.find(r => r.userId === userId);
      const userRating = userRatingObj ? userRatingObj.rating : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        userRating,
        totalRatings: ratings.length
      };
    });

    // Apply filtering (search by Name and Address)
    if (name) {
      storeList = storeList.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (address) {
      storeList = storeList.filter(s => s.address.toLowerCase().includes(address.toLowerCase()));
    }

    // Apply sorting
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      storeList.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (valA === null || valA === undefined) return 1 * order;
        if (valB === null || valB === undefined) return -1 * order;

        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * order;
        }
        return (valA - valB) * order;
      });
    } else {
      // Default sort by store name ascending
      storeList.sort((a, b) => a.name.localeCompare(b.name));
    }

    return res.json(storeList);
  } catch (error) {
    console.error("Get stores for user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Submit or modify rating for a store
const submitOrModifyRating = async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);
    const userId = req.user.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Upsert rating
    const submittedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId
        }
      },
      update: {
        rating: parseInt(rating)
      },
      create: {
        userId,
        storeId,
        rating: parseInt(rating)
      }
    });

    return res.json({
      message: "Rating saved successfully",
      rating: submittedRating
    });
  } catch (error) {
    console.error("Submit or modify rating error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getStoresForUser,
  submitOrModifyRating
};
