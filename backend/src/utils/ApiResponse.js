class ApiResponse {
  constructor(statusCode, message = "success", data = null) {
    this.statusCode = statusCode;
    this.status = statusCode; // backward compatibility for older clients
    this.message = message;
    this.data = data ?? null;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }
}

export default ApiResponse;