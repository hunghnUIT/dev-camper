const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const sanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const errorHandle = require('./middlewares/error.middleware');

const bootcampRoute = require('./routes/bootcamp.route');
const courseRoute = require('./routes/course.route');
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({path: './config/config.env'})

// Connect to DB
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Mongo sanitize => Prevent mongodb ejections
app.use(sanitize()); 

// Set security headers => Add more header to prevent xss attack
app.use(helmet());

// Prevent xss attack
app.use(xss());

// Enable CORS
app.use(cors());

// Rate limit
const limiter = rateLimit({
    windowMs: 10*60*1000, //10 mins
    max: 100
});
app.use(limiter);

// prevent http params pollution
app.use(hpp());

//Logger only in development mode
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

const PORT = process.env.PORT || 5000;

/**
 * Thứ tự của app.use(<middleware/route>) RẤT QUAN TRỌNG.
 * app sẽ thực hiện theo thứ tự tuyến tính -> trên xuống dưới.
 * VD như errorHandle ở cuối cũng thì sau khi thực hiện trong các controller ở các route ở trên xong,
 * nếu gọi next thì nó sẽ tiếp tục thực hiện errorHandle,
 * vì vậy nên mọi hàm trong controller phải có return res để dừng process, ko đợi gọi next.
 */
app.use("/api/bootcamps",bootcampRoute);
app.use("/api/courses",courseRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

app.use(errorHandle);


app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));


// Chỉ sử dụng cái này khi mà không sử dụng promise trong connect mongoDB ở db.js
// process.on('unhandledRejection', (err, promise)=>{
//     console.log(`Error: ${err.message}`);
//     // Close server and exit process
//     server.close(()=>process.exit(1));
// });