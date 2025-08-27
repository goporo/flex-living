const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.details = err.details?.map(detail => detail.message) || [];
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    return res.status(400).json(error);
  }

  if (err.code === 'ECONNREFUSED') {
    error.message = 'External service unavailable';
    return res.status(503).json(error);
  }

  if (err.response?.status) {
    // Handle API errors (from Hostaway, Google, etc.)
    const status = err.response.status;
    error.message = `External API Error: ${err.response.statusText}`;
    error.apiError = true;

    if (status === 401) {
      error.message = 'API authentication failed';
    } else if (status === 403) {
      error.message = 'API access forbidden';
    } else if (status === 429) {
      error.message = 'API rate limit exceeded';
    }

    return res.status(status >= 500 ? 503 : status).json(error);
  }

  // Default to 500 server error
  res.status(err.statusCode || 500).json(error);
};

module.exports = errorHandler;
