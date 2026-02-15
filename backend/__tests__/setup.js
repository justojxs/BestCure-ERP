import mongoose from 'mongoose';

// pre-creates collections before tests run
// needed because mongo can't create collections inside a transaction
export default async function setup() {
    const uri = process.env.MONGO_URI;
    if (!uri) return;

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
    }

    const db = mongoose.connection.db;
    const existing = (await db.listCollections().toArray()).map((c) => c.name);

    const required = ['orders', 'products', 'users'];
    for (const name of required) {
        if (!existing.includes(name)) {
            await db.createCollection(name);
        }
    }

    await mongoose.connection.close();
}
