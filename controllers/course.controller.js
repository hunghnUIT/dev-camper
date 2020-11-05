const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async.middleware');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get courses
// @route     GET /api/courses
// @route     GET /api/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;
    
    if (req.params.bootcampId) {
        query = await Course.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: query.length,
            data: query
        });
    } else {
        query = await Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });
        if(query.length)
            res.status(200).json(query);
        else
            next(new ErrorResponse(`No course found`),404)
    }
});


// @desc      Get a single course
// @route     GET /api/courses/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`),
            404
        );
    }

    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc      Create a single course
// @route     POST /api/bootcamps/:bootcampId/courses
// @access    Private
module.exports.createCourse = asyncHandler(async (req, res, next)=>{
    /**
     * Flow:
     * Search for the id of a bootcamp.
     * Create a new course with that bootcamp's id for 'bootcamp'
     */

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    //Not found bootcamp
    if(!bootcamp){
        return next(new ErrorResponse(`Not found bootcamp ID: ${req.params.bootcampId}`,404));
    }

    // Check bootcamp's owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User id ${req.user.id} is not authorized to add course to this bootcamp`, 401));
    }

    //Found bootcamp -> Create course with corresponding bootcamp
    const newCourse = await Course.create(req.body);

    return res.status(200).json({
        success: true,
        data: newCourse
    });
});


// @desc      Update a course
// @route     POST /api/courses/:id
// @access    Private
module.exports.updateCourse = asyncHandler(async (req, res, next)=>{
    let course = await Course.findById(req.params.id);

    if(!course)
        return next(new ErrorResponse(`No course with id: ${req.params.id}`,404));

    // Check bootcamp's owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User id ${req.user.id} is not authorized to update this course`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id,req.body,{
        runValidators: true,
        new: true
    })

    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc      Delete a course
// @route     DELETE /api/courses/:id
// @access    Private

module.exports.deleteCourse = asyncHandler(async (req, res, next)=>{
    /**
     * Giải thích (Cách này sẽ tường minh hơn kha khá.):
     * Tìm -> Không có thì báo lỗi không thấy, còn nếu có thì xóa rồi thông báo thành công.
     * 
     * CÁCH NÀY TƯỜNG MINH HƠN CÁCH Ở TRÊN UPDATE VÌ:
     * Tìm xong update luôn, nếu tìm thấy và update thành công thì course ở trên sẽ không null
     * Còn không tìm thấy thì course đó sẽ null.
     * Xong xuôi xét course, nếu null thì lỗi không thì báo thành công.
     */
    let course = await Course.findById(req.params.id);
    
    if(!course)
        return next(new ErrorResponse(`No course with id: ${req.params.id}`,404));

    // Check bootcamp's owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User id ${req.user.id} is not authorized to remove this course`, 401));
    }
    
    await course.remove();
    console.log("Inside controller: ");
    console.log((await Course.find()).length);
    res.status(200).json({
        success: true,
        data: course
    });
});