import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import GameResult from '../schemas/GameResult';
import NoContentException from '../errors/NoContentException';
import ServerErrorException from '../errors/ServerErrorException';
import responseCreate from '../responses/ResponseCreate';
import responseOk from '../responses/ResponseOk';

class GameResultController extends Controller {
	constructor() {
		super('/game-result');
	}
	protected initRoutes(): void {
		this.router.post(this.path, this.create);
		this.router.get(
			`${this.path}/patient/:patientId/game/:gameId`,
			this.listByPatientIdAndGameId
		);
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

	private async listByPatientIdAndGameId(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { patientId, gameId } = req.params;
			let gameResults: any = [];

			gameResults = await GameResult.find({
				patientId,
				gameId,
			});

			if (gameResults.length) return responseOk(res, gameResults);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
}

export default GameResultController;
