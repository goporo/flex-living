const logger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;

  // Log request
  console.log(`📝 ${new Date().toISOString()} - ${method} ${url} - IP: ${ip}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Color code based on status
    let statusColor = '🟢'; // 2xx
    if (statusCode >= 400 && statusCode < 500) statusColor = '🟡'; // 4xx
    if (statusCode >= 500) statusColor = '🔴'; // 5xx

    console.log(`${statusColor} ${method} ${url} - ${statusCode} - ${duration}ms`);

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = logger;
