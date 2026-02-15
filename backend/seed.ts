import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import User from "./models/User.js";
import Order from "./models/Order.js";
import logger from "./utils/logger.js";

dotenv.config();

// database seeder — idempotent by default (only inserts if collections are empty)
// run with --reset to wipe and re-seed
const SEED_PRODUCTS = [
    { name: "Amoxycillin 500mg", batch: "B1001", supplier: "PharmaVet Inc", stock: 1500, minStock: 200, price: 15.5, expiry: new Date("2027-12-01"), category: "Antibiotics" },
    { name: "Ivermectin Injection", batch: "B1002", supplier: "Global Meds", stock: 45, minStock: 50, price: 45.0, expiry: new Date("2027-06-15"), category: "Antiparasitic" },
    { name: "Rabies Vaccine", batch: "V2023", supplier: "BioSafe", stock: 120, minStock: 100, price: 25.0, expiry: new Date("2026-11-20"), category: "Vaccines" },
    { name: "Meloxicam", batch: "M554", supplier: "PharmaVet Inc", stock: 800, minStock: 100, price: 12.0, expiry: new Date("2027-01-10"), category: "Anti-inflammatory" },
    { name: "Calcium Supplement", batch: "C990", supplier: "NutriVet", stock: 10, minStock: 30, price: 8.5, expiry: new Date("2027-08-30"), category: "Supplements" },
    { name: "Dexamethasone Injection", batch: "D201", supplier: "Global Meds", stock: 200, minStock: 50, price: 22.0, expiry: new Date("2027-03-15"), category: "Anti-inflammatory" },
    { name: "Oxytetracycline 300mg", batch: "O110", supplier: "PharmaVet Inc", stock: 320, minStock: 100, price: 18.0, expiry: new Date("2027-07-22"), category: "Antibiotics" },
    { name: "Parvovirus Vaccine", batch: "V3045", supplier: "BioSafe", stock: 85, minStock: 80, price: 32.0, expiry: new Date("2026-09-10"), category: "Vaccines" },
    { name: "Albendazole Bolus", batch: "A440", supplier: "NutriVet", stock: 600, minStock: 150, price: 6.5, expiry: new Date("2027-11-01"), category: "Antiparasitic" },
    { name: "Vitamin B Complex", batch: "VB50", supplier: "NutriVet", stock: 950, minStock: 200, price: 10.0, expiry: new Date("2028-02-28"), category: "Supplements" },
    { name: "Enrofloxacin 100ml", batch: "E222", supplier: "Global Meds", stock: 140, minStock: 60, price: 55.0, expiry: new Date("2027-04-18"), category: "Antibiotics" },
    { name: "Fipronil Spray", batch: "F810", supplier: "PharmaVet Inc", stock: 70, minStock: 40, price: 28.0, expiry: new Date("2027-10-05"), category: "Antiparasitic" },
];

const SEED_USERS = [
    { name: "Mr. Umesh Kumar (Owner)", email: "umesh@bestcure.com", role: "admin" },
    { name: "Mr. Ojas Gupta", email: "ojas@bestcure.com", role: "staff" },
    { name: "Happy Paws Veterinary", email: "happypaws@clinic.com", role: "customer" },
    { name: "City Pet Hospital", email: "citypet@clinic.com", role: "customer" },
];

// Generate realistic demo orders
const generateDemoOrders = (products, users) => {
    const customers = users.filter(u => u.role === "customer");
    const staff = users.filter(u => u.role !== "customer");
    const statuses = ["accepted", "accepted", "accepted", "pending", "rejected"];
    const orders = [];

    for (let i = 0; i < 25; i++) {
        const daysAgo = Math.floor(Math.random() * 180);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, numItems);
        const items = selectedProducts.map(p => ({
            product: p._id,
            name: p.name,
            batch: p.batch,
            price: p.price,
            quantity: Math.floor(Math.random() * 20) + 1,
        }));

        const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const tax = Math.round(subtotal * 0.18 * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];

        orders.push({
            orderNumber: `ORD-${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(4, "0")}`,
            customer: customer._id,
            customerName: customer.name,
            items,
            subtotal: Math.round(subtotal * 100) / 100,
            tax,
            total,
            status,
            statusNote: status === "rejected" ? "Out of stock for this batch" : "",
            acceptedBy: status === "accepted" ? staff[0]._id : undefined,
            createdAt,
            updatedAt: createdAt,
        });
    }

    return orders;
};

const seedDatabase = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/bestcure_erp";
        await mongoose.connect(uri);
        logger.info("Connected to MongoDB for seeding");

        const shouldReset = process.argv.includes("--reset");

        if (shouldReset) {
            logger.warn("Resetting database...");
            await Product.deleteMany({});
            await User.deleteMany({});
            await Order.deleteMany({});
        }

        // Seed users
        let users;
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const salt = await bcrypt.genSalt(12);
            const usersWithPasswords = await Promise.all(
                SEED_USERS.map(async (u) => ({
                    ...u,
                    password: await bcrypt.hash("demo1234", salt),
                }))
            );
            users = await User.insertMany(usersWithPasswords);
            logger.info(`Seeded ${users.length} users (password: demo1234)`);
        } else {
            users = await User.find({});
            logger.info(`Users already exist (${userCount}), skipping`);
        }

        // Seed products
        let products;
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            products = await Product.insertMany(SEED_PRODUCTS);
            logger.info(`Seeded ${products.length} products`);
        } else {
            products = await Product.find({});
            logger.info(`Products already exist (${productCount}), skipping`);
        }

        // Seed orders
        const orderCount = await Order.countDocuments();
        if (orderCount === 0 && users.length > 0 && products.length > 0) {
            const demoOrders = generateDemoOrders(products, users);
            await Order.insertMany(demoOrders);
            logger.info(`Seeded ${demoOrders.length} demo orders`);
        } else {
            logger.info(`Orders already exist (${orderCount}), skipping`);
        }

        logger.info("Seeding complete");
    } catch (error) {
        logger.error("Seeding failed", { error: error.message });
    } finally {
        await mongoose.connection.close();
    }
};

// Run if called directly
seedDatabase();

export { seedDatabase, SEED_PRODUCTS, SEED_USERS };
