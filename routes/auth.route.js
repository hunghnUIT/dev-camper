const express = require('express');
const { register,
        login,
        getMyAccount,
        forgotPassword,
        resetPassword,
        updateAccount,
        changePassword,
        logout
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router
    .post('/register', register)
    .post('/login', login)
    .get('/logout',logout)
    .get('/my-account', protect, getMyAccount)
    .post('/forgot-password', forgotPassword)
    .put('/reset-password/:token', resetPassword)
    .put('/update-account', protect, updateAccount)
    .put('/change-password', protect, changePassword)


module.exports = router;