// stops the in-memory mongo instance after all tests finish
export default async function globalTeardown() {
    if (globalThis.__MONGOD__) {
        await globalThis.__MONGOD__.stop();
    }
}
