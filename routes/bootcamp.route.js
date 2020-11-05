const express = require('express');
const controller = require('../controllers/bootcamp.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Cách dưới cổ lỗ sĩ rồi bạn êi.
// router.get('/', controller.getAllBootcamp);
// router.post('/', controller.postBootcamp);
// router.get('/:id', controller.getBootcampWithId);
// router.put('/:id', controller.putBootcamp);
// router.delete('/:id', controller.deleteBootcamp);


// Cách hiện đại này:
router
    .route('/')
    .get(controller.getAllBootcamp)
    .post(protect, authorize('publisher', 'admin'), controller.createBootcamp);

router
    .route('/:id')
    .get(controller.getBootcampWithId)
    .put(protect, authorize('publisher', 'admin'), controller.updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), controller.deleteBootcamp)


// Cách 1:
// router
//     .route('/:bootcampId/courses')
//     .get(courseController.getCourses)
    

// Cách 2: re-route into other resource routers
const courseRoute = require('./course.route');

router.use('/:bootcampId/courses', courseRoute);

/**
 * Giải thích:
 * Ở trên router.use(...) cũng GIỐNG HỆT với app.use(...)
 * Khi này URL có dạng ./:bootcampId/courses/<something here if there is> 
 * Và courseRoute sẽ check '<something here if there is>' để gọi hàm phù hợp.
 */

module.exports = router;