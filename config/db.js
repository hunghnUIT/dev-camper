const mongoose = require('mongoose');

const mongooseOption = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
};

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI, mongooseOption,(error)=>{
        if(error)
            console.log(error);
        else
            console.log('Connected to DB.');
        }
    );
    // console.log(`MongoDB Connected: ${conn.connection.host}`);
}

module.exports = connectDB;