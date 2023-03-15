import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Your API Title',
			version: '1.0.0',
		},
	},
	apis: [path.join(__dirname, './controllers/*.ts')],
};

const specs = swaggerJsdoc(options);

export default specs;
