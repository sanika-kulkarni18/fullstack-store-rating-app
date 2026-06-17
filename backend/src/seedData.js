const bcrypt = require('bcryptjs');
const prisma = require('./db');

const seedDummyData = async () => {
  try {
    const storeCount = await prisma.store.count();
    if (storeCount > 0) {
      console.log("Database already contains stores. Skipping dummy seeding.");
      return;
    }

    console.log("Seeding rich dummy data...");
    const defaultPasswordHash = await bcrypt.hash('Password!123', 10);

    // Create 3 Store Owner Users and their Stores
    const storesData = [
      {
        name: 'Decathlon Sports Outlet Hub',
        email: 'cybercity@decathlon.com',
        address: 'Plot 24, Cyber City Phase 2, Sector 56, Gurgaon, India'
      },
      {
        name: 'The Grand Organic Bakeries',
        email: 'info@organicbakeries.com',
        address: 'Suite 405, Hill Road Heights, Bandra West, Mumbai, India'
      },
      {
        name: 'Starbucks Premium Roastery',
        email: 'elante@starbucks.co.in',
        address: 'Ground Floor, Elante Mall Industrial Area, Chandigarh, India'
      }
    ];

    const createdStores = [];

    for (const store of storesData) {
      const owner = await prisma.user.create({
        data: {
          name: `${store.name} Owner Account`,
          email: store.email,
          address: store.address,
          password: defaultPasswordHash,
          role: 'STORE_OWNER'
        }
      });

      const dbStore = await prisma.store.create({
        data: {
          name: store.name,
          email: store.email,
          address: store.address,
          ownerId: owner.id
        }
      });

      createdStores.push(dbStore);
      console.log(`Seeded Store: ${store.name}`);
    }

    // Create 2 Normal Users
    const usersData = [
      {
        name: 'John Jonathan Peterson',
        email: 'john.peterson@gmail.com',
        address: 'Flat 4A, Green Valley Apartments, Noida Sector 62, India'
      },
      {
        name: 'Sarah Cunningham Williams',
        email: 'sarah.williams@yahoo.com',
        address: 'House 289, Jubilee Hills Road No 10, Hyderabad, India'
      }
    ];

    const createdUsers = [];

    for (const user of usersData) {
      const dbUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          address: user.address,
          password: defaultPasswordHash,
          role: 'NORMAL'
        }
      });
      createdUsers.push(dbUser);
      console.log(`Seeded Normal User: ${user.name}`);
    }

    // Seed some initial ratings
    // John Peterson rates:
    // Decathlon -> 5
    // Organic Bakeries -> 4
    await prisma.rating.createMany({
      data: [
        { userId: createdUsers[0].id, storeId: createdStores[0].id, rating: 5 },
        { userId: createdUsers[0].id, storeId: createdStores[1].id, rating: 4 }
      ]
    });

    // Sarah Williams rates:
    // Decathlon -> 4
    // Starbucks -> 5
    await prisma.rating.createMany({
      data: [
        { userId: createdUsers[1].id, storeId: createdStores[0].id, rating: 4 },
        { userId: createdUsers[1].id, storeId: createdStores[2].id, rating: 5 }
      ]
    });

    console.log("Rich dummy data seeded successfully!");
  } catch (error) {
    console.error("Seeding dummy data error:", error);
  }
};

module.exports = { seedDummyData };
