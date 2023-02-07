import HttpStatusCode from './HttpStatusCode';
import { Response } from 'express';

function responseCreate(res: Response, body: any) {
	const status = HttpStatusCode.CREATED;
	const message = 'Criado com sucesso.';
	const error = false;
	const filteredBody = {
		name: body.name,
		email: body.email,
	};

	return res.status(status).send({
		status,
		message,
		error,
		body: filteredBody,
	});
}

export default responseCreate;
