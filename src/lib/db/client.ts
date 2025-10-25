import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_CONNECTION_STRING;
const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    maxPoolSize: 20,
    minPoolSize: 1,
};

if (!uri) {
    throw new Error(
        "Please add your Mongo URI to .env.local or environment variables"
    );
}

let client: MongoClient;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
}

const clientPromise = global._mongoClientPromise;

export default clientPromise;
