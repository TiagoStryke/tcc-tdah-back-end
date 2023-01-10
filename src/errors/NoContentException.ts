import HttpException from './HttpException';
import HttpStatusCode from '../responses/HttpStatusCode';

class NoContentException extends HttpException {
	constructor() {
		super(HttpStatusCode.NO_CONTENT, 'Não foi localizado nenhum registro.');
	}
}

export default NoContentException;
