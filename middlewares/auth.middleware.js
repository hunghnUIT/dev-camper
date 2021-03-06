const jwt = require('jsonwebtoken');
const asyncHandler = require('./async.middleware');
const errorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes
exports.protect = asyncHandler(async (req,res, next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.replace("Bearer ", "")
    }

    // Check cookies for token
    else if (req.cookies.token){
        token = req.cookies.token
    }

    if(!token)
        return next(new ErrorResponse("Not authorize to access this route", 401));

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ErrorResponse("Not authorize to access this route", 401));
    }
});

// Grant access to specific role.
// ... means a bunch of input like all element in arrays, list,...
exports.authorize = (...roles )=>{
    return  (req, res, next)=>{
        if(!req.user)
            return next(new ErrorResponse("Login required.", 401));
        if(!roles.includes(req.user.role))
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route.`, 403));
        next();
        };
};