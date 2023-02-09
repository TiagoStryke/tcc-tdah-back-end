import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import GameResult from '../schemas/GameResult';
import ServerErrorException from '../errors/ServerErrorException';
import responseCreate from '../responses/ResponseCreate';

class GameResultController extends Controller {
	constructor() {
		super('/game-result');
	}
	protected initRoutes(): void {
		this.router.post(this.path, this.create);
	}

	private async create(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { patientId, gameId, results } = req.body;
			const gameResult = await GameResult.create({
				patientId,
				gameId,
				results,
			});
			return responseCreate(res, gameResult);
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
}

export default GameResultController;
