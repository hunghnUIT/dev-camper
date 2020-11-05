const User = require('../models/User');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse');
const { find } = require('../models/User');

// @desc:       get all users
// @route:      GET /api/users
// @access:     private/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    return res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

// @desc:       get a single user
// @route:      GET /api/users/:userId
// @access:     private/admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId)
    return res.status(200).json({
        success: true,
        data: user
    });
});

// @desc:       create a new user
// @route:      POST /api/users
// @access:     private/admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    
    return res.status(201).json({
        success: true,
        data: user
    });
});

// @desc:       update a user
// @route:      PUT /api/users/:userId
// @access:     private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
        new: true,
        runValidators: true
    });
    return res.status(200).json({
        success: true,
        data: user
    });
});

// @desc:       delete a user
// @route:      DELETE /api/users/:userId
// @access:     private/admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.userId);
    return res.status(200).json({
        success: true,
        data: {}
    });
});