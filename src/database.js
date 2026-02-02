import mongoose from 'mongoose'

mongoose.set('strictQuery', true)


const connection = async () => {
    if (mongoose.connections[0].readyState) {
        console.log("Using existing connection");
        return;
    }

    try {
        const { connection } = await mongoose.connect(process.env.MONGODB_URI_PRODUCTION);
        console.log(`Database is connected on ${connection.host} - ${connection.port}`);
    } catch (error) {
        console.log(error);
    }
}

export default connection