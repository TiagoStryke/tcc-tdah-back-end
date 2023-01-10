import HttpStatusCode from './HttpStatusCode';
import { Response } from 'express';

function responseRunTimeError(
	res: Response,
	status: HttpStatusCode,
	message: string
) {
	const error = true;
	const body = {};

	return res.status(status).send({
		status,
		message,
		error,
		body,
	});
}

export default responseRunTimeError;
