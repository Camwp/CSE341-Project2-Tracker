export const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.name || 'ServerError', message: err.message });
};
