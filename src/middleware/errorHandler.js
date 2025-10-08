const errorHandler = (err, req, res, next) => {
    // Log the error for the developer
    console.error(err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
};

module.exports = errorHandler;