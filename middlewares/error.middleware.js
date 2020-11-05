const ErrorResponse = require('../utils/errorResponse')

const errorHandle = (err, req, res, next)=>{
    // Log to console for developer 

    let error = { ...err } // error = Whole object err
    error.message = err.message

    if(err.name === 'CastError'){
        const message = `Resource id ${err.value} is not found`;
        error = new ErrorResponse(message, 404);
    }
    
    //Mongoose duplicate key
    else if(err.code === 11000 ){
        const message = 'Duplicate field value entered.'
        error = new ErrorResponse(message, 400);
    }

    else if(err.name === 'ValidatorError'){
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status( error.statusCode || 400).json({
        success: false,
        error: error.message || 'Bad request'
    });
};

module.exports = errorHandle;