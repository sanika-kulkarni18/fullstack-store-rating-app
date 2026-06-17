require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const prisma = require('./db');
const routes = require('./routes');
const { seedDummyData } = require('./seedData');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', routes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: "Store Rating API is active." });
});

// Database seeding function
const seedAdmin = async () => {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (adminCount === 0) {
      console.log("No Administrator found. Seeding default Admin user...");
      const hashedPassword = await bcrypt.hash('Admin!123456', 10);
      
      const admin = await prisma.user.create({
        data: {
          name: 'System Administrator Account',
          email: 'admin@storerating.com',
          password: hashedPassword,
          address: 'System Admin HQ, Main Street',
          role: 'ADMIN'
        }
      });
      
      console.log("Default Admin user seeded successfully:");
      console.log(`Email: ${admin.email}`);
      console.log(`Password: Admin!123456`);
    } else {
      console.log("Admin user already exists. Seeding skipped.");
    }

    // Seed rich dummy data if database is empty of stores
    await seedDummyData();
  } catch (error) {
    console.error("Database seeding error:", error);
  }
};

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await seedAdmin();
});
