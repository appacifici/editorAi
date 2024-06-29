import mongoose from 'mongoose';
import dotenv   from 'dotenv';

const result = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
if (result.error) {
    console.log( result.error );
}

const connectMongoDB = async () => {
    try {
        await mongoose.connect(`mongodb://openaiuser:h98834958fh3405870@${process.env.MONGO_DB_HOST}:27017/newsgpt?authSource=admin`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Mongoose connected to MongoDB');
        console.log(`mongodb://${process.env.MONGO_DB_HOST}:27017/newsgpt`);
    } catch (err) {
        console.error('Error connecting to MongoDB',err);        
        process.exit(1);
    }
};

export default connectMongoDB;
