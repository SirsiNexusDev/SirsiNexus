FROM node:18-alpine

WORKDIR /app

# Create a simple placeholder frontend
RUN echo '{"name":"sirsi-frontend","version":"1.0.0","scripts":{"start":"node server.js"},"dependencies":{"express":"^4.18.0"}}' > package.json

RUN npm install

# Create a simple server
RUN echo 'const express = require("express"); \
const app = express(); \
const PORT = 3000; \
\
app.get("/", (req, res) => { \
  res.send(` \
<!DOCTYPE html> \
<html> \
<head><title>SirsiNexus Demo</title></head> \
<body> \
  <h1>🎯 SirsiNexus Library Management Platform</h1> \
  <h2>Demo Environment</h2> \
  <div> \
    <h3>Available Features:</h3> \
    <ul> \
      <li>User Management</li> \
      <li>Catalog System</li> \
      <li>Analytics Dashboard</li> \
      <li>System Monitoring</li> \
    </ul> \
    <p>Status: <span style="color:green">✅ Online</span></p> \
    <p>Version: v1.0.0-demo</p> \
  </div> \
</body> \
</html> \
  `); \
}); \
\
app.get("/health", (req, res) => { \
  res.json({status: "healthy", service: "frontend", timestamp: new Date().toISOString()}); \
}); \
\
app.listen(PORT, () => { \
  console.log(`SirsiNexus Frontend running on port ${PORT}`); \
});' > server.js

EXPOSE 3000

CMD ["npm", "start"]
