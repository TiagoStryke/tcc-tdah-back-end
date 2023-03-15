import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Projeto TCC - API',
			version: '1.0.0',
		},
	},
	apis: [path.join(__dirname, './controllers/*.ts')],
	swaggerOutput: './swagger.json',
};

const specs = swaggerJsdoc(options);

// Function to write Swagger specifications to file
const writeSwaggerToFile = () => {
	try {
		fs.writeFileSync(options.swaggerOutput, JSON.stringify(specs, null, 2));
		console.log(`Swagger specifications written to ${options.swaggerOutput}`);
	} catch (error) {
		console.error(`Error writing Swagger specifications to file: ${error}`);
	}
};

export default specs;
export { writeSwaggerToFile }; // Export the function to write Swagger to file
