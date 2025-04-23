const fs = require('fs');
const swaggerSpec = require('./swagger-config');

// Write the Swagger JSON to a file
fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2), 'utf-8');
console.log('swagger.json has been generated!');