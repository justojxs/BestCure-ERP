/**
 * Jest global teardown — stops the in-memory MongoDB instance.
 */
export default async function globalTeardown() {
    if (globalThis.__MONGOD__) {
        await globalThis.__MONGOD__.stop();
    }
}
