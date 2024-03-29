import HttpStatusCode from './HttpStatusCode';
import { Response } from 'express';

function responseNotFound(res: Response) {
	const status = HttpStatusCode.NOT_FOUND;
	const message = 'Não identificado.';
	const error = true;
	const body = {};

	return res.status(status).send({
		status,
		message,
		error,
		body,
	});
}

export default responseNotFound;
