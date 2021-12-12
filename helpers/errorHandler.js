function errorHandler(err, req, res, next) {
    
    // jwt authentication error
    if(err.name === 'UnauthorizedError'){
        return res.status(401).json({ message: err.message})
    } else {
        next(err)
    }

    // validation error
    if (err.name === 'ValidationError') {
        return res.status(401).json({ message: err.name + ": " + err.message })
    } else {
        next(err)
    }

    // default to 500 server error
    return res.status(500).json(err)
}

module.exports = errorHandler