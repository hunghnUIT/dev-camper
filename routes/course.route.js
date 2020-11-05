const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/course.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router({ mergeParams: true });

// const advancedResults = require('../middleware/advancedResults');

router
    .route('/')
    .get(getCourses)
    .post(protect, authorize('publisher', 'admin'), createCourse)

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router;