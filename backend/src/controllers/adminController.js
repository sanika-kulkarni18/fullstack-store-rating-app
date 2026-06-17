const bcrypt = require('bcryptjs');
const prisma = require('../db');

// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    return res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Add New User (Admin/Normal/Store Owner)
const addUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists", errors: { email: "Email already exists" } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        address,
        password: hashedPassword,
        role: role || 'NORMAL'
      }
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Admin add user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Add New Store and Automatically Create Store Owner
const addStore = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    // Check if the email is already in use by any user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered to a user or store", errors: { email: "Email is already registered to a user or store" } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the Store Owner User and Store in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          name,
          email,
          address,
          password: hashedPassword,
          role: 'STORE_OWNER'
        }
      });

      const store = await tx.store.create({
        data: {
          name,
          email,
          address,
          ownerId: owner.id
        }
      });

      return { owner, store };
    });

    return res.status(201).json({
      message: "Store and Owner created successfully",
      store: result.store,
      owner: {
        id: result.owner.id,
        name: result.owner.name,
        email: result.owner.email,
        role: result.owner.role
      }
    });
  } catch (error) {
    console.error("Admin add store error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// View list of all users with sorting and filtering
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    // We fetch all users and their stores and ratings
    const users = await prisma.user.findMany({
      include: {
        store: {
          include: {
            ratings: true
          }
        }
      }
    });

    // Compute details like store ratings for Store Owners
    let userList = users.map(user => {
      let rating = null;
      if (user.role === 'STORE_OWNER' && user.store) {
        const ratings = user.store.ratings;
        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
          rating = parseFloat((sum / ratings.length).toFixed(2));
        } else {
          rating = 0.0;
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        rating: rating, // average rating of their store
        storeId: user.store ? user.store.id : null,
        createdAt: user.createdAt
      };
    });

    // Apply filtering in memory for maximum flexibility (Name, Email, Address, Role)
    if (name) {
      userList = userList.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (email) {
      userList = userList.filter(u => u.email.toLowerCase().includes(email.toLowerCase()));
    }
    if (address) {
      userList = userList.filter(u => u.address.toLowerCase().includes(address.toLowerCase()));
    }
    if (role) {
      userList = userList.filter(u => u.role === role);
    }

    // Apply sorting in memory
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      userList.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        // Handle null values
        if (valA === null || valA === undefined) return 1 * order;
        if (valB === null || valB === undefined) return -1 * order;

        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * order;
        }
        return (valA - valB) * order;
      });
    } else {
      // Default sort by id desc
      userList.sort((a, b) => b.id - a.id);
    }

    return res.json(userList);
  } catch (error) {
    console.error("Admin get users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// View list of all stores with sorting and filtering
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy, sortOrder } = req.query;

    const stores = await prisma.store.findMany({
      include: {
        ratings: true
      }
    });

    let storeList = stores.map(store => {
      const ratings = store.ratings;
      let rating = 0;
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        rating = parseFloat((sum / ratings.length).toFixed(2));
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating: rating,
        totalRatings: ratings.length
      };
    });

    // Apply filtering
    if (name) {
      storeList = storeList.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (email) {
      storeList = storeList.filter(s => s.email.toLowerCase().includes(email.toLowerCase()));
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
      // Default sort by id desc
      storeList.sort((a, b) => b.id - a.id);
    }

    return res.json(storeList);
  } catch (error) {
    console.error("Admin get stores error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getStores
};
