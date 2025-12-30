import mongoose from 'mongoose'; //Imports the mongoose library

type MongooseCache = { //create a TypeScript type that describes how you’ll cache the DB connection.
    conn: typeof mongoose | null; //Stores the actual connected mongoose instance
    promise: Promise<typeof mongoose> | null; //Stores the ongoing connection promise
};


//TypeScript does not know about global.mongoose by default
//This tells ts that global.mongoose exists and is of type MongooseCache or undefined
declare global {
    var mongoose: MongooseCache | undefined;
};

const MONGODB_URI = process.env.MONGODB_URI; //Get the MongoDB connection string from environment variables


//Create or reuse cached connection
// If a connection already exists → reuse it
// Otherwise → create an empty cache object
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };


//Store cache on global object
//In Next.js hot reloading can cause this file to be executed multiple times
//Storing the connection in a global variable prevents multiple connections during development
if(!global.mongoose){
    global.mongoose = cached;
}



//Create the conncection function it return a promise that resolves to the mongoose instance
async function connectDb(): Promise<typeof mongoose> {

    //Safety check for missing URI
    //If URI is missing → crash immediately
    if(!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable.');
    }

    //Return existing connection if already connected
    //If DB is connected → return the cached connection
    if(cached.conn){
        return cached.conn;
    }

    //Create a connection promise if none exists
    if(!cached.promise){

        //Connection options
        //Prevents mongoose from buffering queries
        //Queries fail immediately if not connected
        const options = {
            bufferCommands: false,
        };


        //Connect to MongoDB
        cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
            return mongoose;
        });
    }

    //Await the connection
    try{
        cached.conn = await cached.promise;
    } catch(error){
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

export default connectDb;