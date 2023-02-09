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
			`${this.path}/patient/:patientId/game/:gameId/:initialDate/:finalDate/:sound`,
			this.listByPatientIdAndGameId
		);
		this.router.get(
			`${this.path}/patient/:patientId/game/:gameId/:initialDate/:finalDate/:sound/average`,
			this.listAverageByPatientIdAndGameIdDatePeriod
		);
	}

	private async create(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { patientId, gameId, results, sound } = req.body;
			const gameResult = await GameResult.create({
				patientId,
				gameId,
				results,
				sound,
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
			const { patientId, gameId, initialDate, finalDate, sound } = req.params;
			let gameResults: any = [];

			gameResults = await GameResult.find({
				patientId,
				gameId,
				sound,
				date: { $gte: new Date(initialDate), $lte: new Date(finalDate) },
			});

			if (gameResults.length) return responseOk(res, gameResults);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}

	private async listAverageByPatientIdAndGameIdDatePeriod(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { patientId, gameId, initialDate, finalDate, sound } = req.params;
			let gameResults: any = [];

			gameResults = await GameResult.find({
				patientId,
				gameId,
				sound,
				date: { $gte: new Date(initialDate), $lte: new Date(finalDate) },
			});

			const averageResults = gameResults.reduce((acc, curr) => {
				for (const key in curr.results) {
					if (acc[key]) {
						acc[key].push(curr.results[key]);
					} else {
						acc[key] = [curr.results[key]];
					}
				}
				return acc;
			}, {});

			const avgResults = {};
			for (const key in averageResults) {
				avgResults[key] =
					averageResults[key].reduce((a, b) => a + b, 0) /
					averageResults[key].length;
			}

			if (gameResults.length) return responseOk(res, avgResults);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
}

export default GameResultController;
