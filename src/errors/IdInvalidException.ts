import HttpException from './HttpException';
import HttpStatusCode from '../responses/HttpStatusCode';

class IdInvalidException extends HttpException {
	constructor() {
		super(HttpStatusCode.BAD_REQUEST, 'Id inválido, favor verificar.');
	}
}

export default IdInvalidException;
