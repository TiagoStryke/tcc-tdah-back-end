import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import GameResult from '../schemas/GameResult';
import NoContentException from '../errors/NoContentException';
import ServerErrorException from '../errors/ServerErrorException';
import moment from 'moment';
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
			`${this.path}/patient/:patientId/game/:gameId/:initialDate/:finalDate/:sound/monthaverage`,
			this.listAverageMonthByPatientIdAndGameId
		);
		this.router.get(
			`${this.path}/patient/:patientId/game/:gameId/:initialDate/:finalDate/:sound/yearaverage`,
			this.listAverageYearByPatientIdAndGameId
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

			gameResults = gameResults.map((result) => {
				return {
					daysLogged: 1,
					_id: result._id,
					patientId: result.patientId,
					gameId: result.gameId,
					results: result.results,
					sound: result.sound,
					date: result.date,
				};
			});

			if (gameResults.length) return responseOk(res, gameResults);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}

	private async listAverageMonthByPatientIdAndGameId(
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
				const currMonth = curr.date.getMonth() + 1;
				const currYear = curr.date.getFullYear();
				const key = `${currMonth}-${currYear}`;
				if (acc[key]) {
					for (const resultKey in curr.results) {
						acc[key][resultKey].push(curr.results[resultKey]);
					}
				} else {
					acc[key] = {};
					for (const resultKey in curr.results) {
						acc[key][resultKey] = [curr.results[resultKey]];
					}
				}
				return acc;
			}, {});

			const avgResults: any = [];
			for (const key in averageResults) {
				const avgResult = {
					daysLogged: 0,
					results: {
						'month-year': key,
					},
				};
				for (const resultKey in averageResults[key]) {
					avgResult.results[resultKey] =
						averageResults[key][resultKey].reduce((a, b) => a + b, 0) /
						averageResults[key][resultKey].length;
				}
				avgResult.daysLogged = new Set(
					gameResults
						.filter(
							(result) =>
								result.date.getMonth() + 1 === parseInt(key.split('-')[0]) &&
								result.date.getFullYear() === parseInt(key.split('-')[1])
						)
						.map((result) => result.date.toDateString())
				).size;
				avgResults.push(avgResult);
			}

			if (gameResults.length) return responseOk(res, avgResults);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}

	private async listAverageYearByPatientIdAndGameId(
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

			const uniqueDates = new Set(
				gameResults.map((result) => result.date.getFullYear())
			);
			const daysLogged = uniqueDates.size;

			const averageResults = gameResults.reduce((acc, curr) => {
				const currYear = curr.date.getFullYear();
				const key = `${currYear}`;
				if (acc[key]) {
					for (const resultKey in curr.results) {
						acc[key][resultKey].push(curr.results[resultKey]);
					}
				} else {
					acc[key] = {};
					for (const resultKey in curr.results) {
						acc[key][resultKey] = [curr.results[resultKey]];
					}
				}
				return acc;
			}, {});

			const avgResults: Record<string, any>[] = [];
			for (const key in averageResults) {
				const avgResult: Record<string, any> = {};
				avgResult.daysLogged = daysLogged;
				avgResult.results = {};
				avgResult.results['year'] = key;
				for (const resultKey in averageResults[key]) {
					avgResult.results[resultKey] =
						averageResults[key][resultKey].reduce((a, b) => a + b, 0) /
						averageResults[key][resultKey].length;
				}
				avgResults.push(avgResult);
			}

			if (gameResults.length) return responseOk(res, avgResults);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
}

export default GameResultController;
[
	{
		daysLogged: 1,
		_id: '63e68c726756465c34e45087',
		patientId: '63e3054fb899d71d20a7a328',
		gameId: '63e675e9ae43555458934434',
		results: {
			timeToClick: 10,
			totalTime: 200,
			totalPoints: 600,
		},
		sound: 'true',
		date: '2023-02-09T18:26:58.649Z',
	},
	{
		daysLogged: 1,
		_id: '63e6a99b3fd5f611c045d04f',
		patientId: '63e3054fb899d71d20a7a328',
		gameId: '63e675e9ae43555458934434',
		results: {
			timeToClick: 20,
			totalTime: 200,
			totalPoints: 600,
		},
		sound: 'true',
		date: '2023-01-10T17:31:23.036Z',
	},
];
