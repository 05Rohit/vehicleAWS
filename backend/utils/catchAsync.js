module.exports = (fun) => {
    return (req, res, next) => {
        fun(req, res, next).catch(next); // Catch any errors and pass them to the error handling middleware
    }
}
