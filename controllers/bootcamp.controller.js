const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middlewares/async.middleware');
const ErrorResponse = require('../utils/errorResponse')


// @desc:       get all bootcamp
// @route:      GET /api/bootcamp/
// @access:     public
module.exports.getAllBootcamp = asyncHandler(async function(req, res, next){
    // try {
        const bootcamp = await Bootcamp.find().populate('courses');
        if(bootcamp){
            res.status(200).json({ 
                status: 'successful',
                message: `Get all bootcamps successful`,
                count: bootcamp.length,
                data: bootcamp
            });
        }
        else{
            res.status(404).json({ 
                status: 'fail',
                message: `Get all bootcamps failed`,
                error: 'No bootcamp found',
                data: bootcamp
            });
        }
    // } catch (error) {
    //     res.status(400).json({ 
    //         status: 'fail',
    //         message: `Get bootcamps failed`,
    //         error: error,
    //         data: null
    //     });
    // }
    
    

});

// @desc:       Create a new bootcamp
// @route:      POST /api/bootcamp/
// @access:     private
module.exports.createBootcamp = async function(req, res, next){
    // Add user to req.body
    req.body.user = req.user.id;

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id})

    // If user is not admin, they can only publish one bootcamp.
    if(req.user.role !== 'admin' && publishedBootcamp){
        return next(new ErrorResponse(`User id ${req.user.id} has already published a bootcamp.`, 400))
    }
    
    let newBootcamp = new Bootcamp(req.body);
    newBootcamp.save((err,bootcamp)=> {
        if (err) {
            console.log(err);
            return next(err)
        }
        else{
                res.status(200).json({ 
                status: 'successful',
                message: `Created a new bootcamp`,  
                data: bootcamp
            });
        }
    });
};

// @desc:       Get a bootcamp
// @route:      GET /api/bootcamp/:id
// @access:     public
module.exports.getBootcampWithId = function(req, res, next){
    Bootcamp.findById(req.params.id,(err, bootcamp)=>{
        if(err){
            console.log("Error "+ err);
            // return res.status(400).json({ 
            //     status: 'fail',
            //     message: `Get bootcamp ID: ${req.params.id} finished with error(s)`,
            //     error: err 
            // });

            // Cách 2:
            // next(new ErrorResponse(`Bootcamp Id: ${req.params.id} not found`,404));

            // Cách 3:
            next(err);
        }
        else{
            if(bootcamp){
                return res.status(200).json({ 
                    status: 'successful',
                    message: `Get bootcamp ID: ${req.params.id} successfully`,
                    data: bootcamp
                });
            }
            else{
                return res.status(404).json({ 
                    status: 'fail',
                    message: `Get bootcamp ID: ${req.params.id} failed`,
                    error: 'Not found bootcamp'
                });
            }
                
        }
    });
    

};

// @desc:       Update a bootcamp
// @route:      PUT /api/bootcamp/:id
// @access:     private
module.exports.updateBootcamp = async function(req, res, next){
    try {
        let bootcamp = await Bootcamp.findById(req.params.id);
    
        if (!bootcamp){
            return res.status(404).json({
                status: 'fail',
                message: `Update bootcamp ID: ${req.params.id} failed`,
                data: bootcamp,
                error: 'Bootcamp not found'
            });
        }

        // Check the owner
        if( bootcamp.user.toString() != req.user.id && req.user.role !== 'admin' ){
            return next(new ErrorResponse(`User id ${req.user.id} is not authorized to modify this bootcamp`, 401));
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({ 
            status: 'successful',
            message: `Updated bootcamp ID: ${req.params.id}`,
            data: bootcamp
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: 'fail',
            message: `Update bootcamp ID: ${req.params.id} failed`,
            data: null,
            error: error
        });
    }
};

// @desc:       Delete a bootcamp
// @route:      DELETE /api/bootcamp/:id
// @access:     private
module.exports.deleteBootcamp = function(req, res, next){
    /**
     * Giải thích:
     * vì khi dùng findOneAndDelete thì sẽ không xóa những course được  
     * do nó không "trigger được middleware pre('remove')" xóa nên phải find trước rồi mới remove
     */
    Bootcamp.findById(req.params.id,(err, bootcamp)=>{
        if(err){
            console.log(err);
            return res.status(200).json({ 
                status: 'failed',
                message: `Deleted bootcamp ID: ${req.params.id} finished with error(s)`,
                error: err
            });
        }
        else{
            if(bootcamp){

                // Check the owner
                if( bootcamp.user.toString() != req.user.id && req.user.role !== 'admin' ){
                    return next(new ErrorResponse(`User id ${req.user.id} is not authorized to modify this bootcamp`, 401));
                }
                bootcamp.remove();
                return res.status(200).json({ 
                    status: 'successful',
                    message: `Deleted bootcamp ID: ${req.params.id}`
                });
            }
            else{
                return res.status(404).json({ 
                    status: 'fail',
                    message: `Delete bootcamp ID: ${req.params.id} failed`,
                    error: 'Not found bootcamp'
                });
            }
            
        }
    });
    
};