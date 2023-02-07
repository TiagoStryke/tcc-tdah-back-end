import { Request, Response } from 'express';

import responseUserNotFound from '../responses/ResponseNotFound';

function UserNotFoundErrorMiddleware(req: Request, res: Response) {
	return responseUserNotFound(res);
}

export default UserNotFoundErrorMiddleware;
