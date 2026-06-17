const prisma = require('../db');

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy, sortOrder } = req.query;

    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: true
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ error: "No store associated with this store owner account." });
    }

    const ratings = store.ratings;
    let averageRating = 0;
    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      averageRating = parseFloat((sum / ratings.length).toFixed(2));
    }

    let usersWhoRated = ratings.map(r => ({
      id: r.id,
      userName: r.user.name,
      userEmail: r.user.email,
      userAddress: r.user.address,
      rating: r.rating,
      createdAt: r.createdAt
    }));

    // Apply sorting
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      usersWhoRated.sort((a, b) => {
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
      // Default sort by rating created date desc
      usersWhoRated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({
      storeId: store.id,
      storeName: store.name,
      storeEmail: store.email,
      storeAddress: store.address,
      averageRating,
      totalRatings: ratings.length,
      usersWhoRated
    });
  } catch (error) {
    console.error("Owner dashboard error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getOwnerDashboard
};
