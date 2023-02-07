import HttpStatusCode from './HttpStatusCode';
import { Response } from 'express';

function responseUserNotFound(res: Response) {
	const status = HttpStatusCode.BAD_REQUEST;
	const message = 'Usuário não encontrado.';
	const error = true;
	const body = {};

	return res.status(status).send({
		status,
		message,
		error,
		body,
	});
}

export default responseUserNotFound;
