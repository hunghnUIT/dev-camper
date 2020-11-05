const User = require('../models/User');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse');
const errorHandle = require('../middlewares/error.middleware');
const sendMail = require('../utils/sendEmail')
const crypto = require('crypto');

// @desc:       Register User
// @route:      POST /api/auth/register
// @access:     public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    // Create token
    // Create token
    sendTokenResponse(user, 200, res)
});

// @desc:       Login User
// @route:      POST /api/auth/login
// @access:     public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password)
        return next(new ErrorResponse("Please provide both email and password.", 400));

    // Check auth user
    const user = await User.findOne({ email }).select('+password') // ES6 allowed to do this.

    if (!user)
        return next(new ErrorResponse("Invalid credentials", 401));

    // Check if password is match
    const isMatch = await user.matchPassword(password);

    if (!isMatch)
        return next(new ErrorResponse("Invalid credentials", 401));

    // Create token
    sendTokenResponse(user, 200, res)
});

// Get token from model, create cookie and send response.
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token: token
        });
};

// @desc:       Get my account
// @route:      GET /api/auth/my-account
// @access:     private
exports.getMyAccount = asyncHandler(async (req, res, next) => {
    const user = User.findById(req.user)
    return res.status(200).json({
        success: true,
        data: req.user
    });
});



// @desc:       Forgot password
// @route:      POST /api/auth/forgot-password
// @access:     public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse("No user with that email found.", 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    user.save({ validateBeforeSave: false });

    // Create reset url
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of password. Please make a PUT request to: \n\n ${resetURL}`

    try {

        // UNCOMMENT BELOW ONCE SET UP SUCCESSFUL MAILTRAP

        // await sendMail({
        //     email: user.email,
        //     subject: 'Password reset token',
        //     message
        // });


        // IF ABOVE SET UP IS COMPLETED, REMOVE FIELD MESSAGE FROM RESPONSE BELOW
        res.status(200).json({
            success: true,
            data: "Email sent",
            message: message
        })
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save({ validateBeforeSave: false })

        return next(ErrorResponse('Email could not be sent'), 500)
    }

    // IN THE TUTORIAL HE PUT A RESPONSE HERE. WHY? 
    // res.status(200).json({
    //     success: true,
    //     data: user
    // });
});


// @desc:       Reset password
// @route:      PUT /api/auth/reset-password/:token
// @access:     public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    let user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    // Not found token or token expires
    if (!user) {
        return next(new ErrorResponse("Invalid token", 400))
    }

    // Set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined // Remove both two field below from DB.
    user.resetPasswordExpire = undefined

    await user.save();

    // Log user in after that.
    sendTokenResponse(user, 200, res);
    return;
});

// @desc:       Update detail account
// @route:      PUT /api/auth/update-account
// @access:     private
exports.updateAccount = asyncHandler(async (req, res, next) => {
    // Only allow to edit fields bellow.
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    return res.status(200).json({
        success: true,
        data: user
    });
});


// @desc:       Change password
// @route:      PUT /api/auth/change-password
// @access:     private
exports.changePassword = asyncHandler(async (req, res, next) => {

    const { currentPassword, newPassword } = req.body;

    let user = await User.findById(req.user.id).select('+password');
    let checkPassword = await user.matchPassword(currentPassword.toString());

    if (!checkPassword) {
        return next(new ErrorResponse("Current password is incorrect", 401))
    }

    // We have to use this way, not findByIdAndUpdate, unless sendTokenResponse below will raise error
    /**
     * Description error:
     * - findByIdAndUpdate return some kind of object, but it's not able to call the 
     * getSignedJwtToken function which is inside UserSchema. Maybe the object return is 
     * just the document so it can't call the function.
     * - findById return also some kind of object but it able to call the function.
     */
    user.password = newPassword;
    user.save()

    sendTokenResponse(user, 200, res);
});


// @desc:       Login User
// @route:      GET /api/auth/logout
// @access:     private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none',{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    
    return res.status(200).json({
        success: true,
        data: {}
    });
})