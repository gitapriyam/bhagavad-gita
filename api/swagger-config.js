const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bhagavad Gita API',
      version: '1.0.0',
      description: 'API documentation for Bhagavad Gita application',
    },
    servers: [
      {
        "url": "https://brave-hill-0370ef31e-development.westus2.6.azurestaticapps.net/api",
      },
    ],
  },
  apis: ['./src/functions/*.js'], // Path to your API files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;