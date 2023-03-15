import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import GameResult from '../schemas/GameResult';
import NoContentException from '../errors/NoContentException';
import ServerErrorException from '../errors/ServerErrorException';
import moment from 'moment';
import responseCreate from '../responses/ResponseCreate';
import responseOk from '../responses/ResponseOk';

/**
 * @swagger
 *	tags:
 *   name: GameResults
 *   description: API for managing game results
 */
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
	/**
	 * Creates a new game result.
	 * @swagger
	 * /game-results:
	 *   post:
	 *     summary: Creates a new game result.
	 *     tags:
	 *       - GameResults
	 *     description: Creates a new game result.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               patientId:
	 *                 type: string
	 *                 description: The ID of the patient who played the game.
	 *               gameId:
	 *                 type: string
	 *                 description: The ID of the game played.
	 *               results:
	 *                 type: object
	 *                 description: The results of the game.
	 *               sound:
	 *                 type: boolean
	 *                 description: Whether sound was enabled during the game.
	 *             example:
	 *               patientId: abc123
	 *               gameId: def456
	 *               results: { "score": 10, "level": 3 }
	 *               sound: true
	 *     responses:
	 *       201:
	 *         description: The created game result.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/GameResult'
	 *       500:
	 *         description: Internal server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ServerErrorException'
	 */

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
	/**
	 * @swagger
	 * /api/game-results/{patientId}/{gameId}/{initialDate}/{finalDate}/{sound}:
	 *   get:
	 *     summary: Get game results for a specific patient and game.
	 *     description: Retrieves all game results for a specific patient and game within a date range, filtered by sound.
	 *     tags:
	 *       - GameResults
	 *     parameters:
	 *       - in: path
	 *         name: patientId
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The ID of the patient to retrieve game results for.
	 *       - in: path
	 *         name: gameId
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The ID of the game to retrieve results for.
	 *       - in: path
	 *         name: initialDate
	 *         schema:
	 *           type: string
	 *           format: date
	 *         required: true
	 *         description: The initial date of the range to retrieve results for.
	 *       - in: path
	 *         name: finalDate
	 *         schema:
	 *           type: string
	 *           format: date
	 *         required: true
	 *         description: The final date of the range to retrieve results for.
	 *       - in: path
	 *         name: sound
	 *         schema:
	 *           type: string
	 *         required: false
	 *         description: The sound to filter the results by (optional).
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: The list of game results for the specified patient and game.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/GameResult'
	 *       204:
	 *         description: The requested game results were not found.
	 *       500:
	 *         description: An error occurred while processing the request.
	 */

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
	/**
	 * @swagger
	 * /average-month-results/{patientId}/{gameId}/{initialDate}/{finalDate}/{sound}:
	 *   get:
	 *     summary: Get the average monthly results of a patient's game
	 *     description: Retrieve the average monthly results of a patient's game for a given period of time.
	 *     tags:
	 *       - GameResults
	 *     parameters:
	 *       - in: path
	 *         name: patientId
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The ID of the patient to retrieve the results for
	 *       - in: path
	 *         name: gameId
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The ID of the game to retrieve the results for
	 *       - in: path
	 *         name: initialDate
	 *         schema:
	 *           type: string
	 *           format: date-time
	 *         required: true
	 *         description: The start date of the period to retrieve the results for (YYYY-MM-DD)
	 *       - in: path
	 *         name: finalDate
	 *         schema:
	 *           type: string
	 *           format: date-time
	 *         required: true
	 *         description: The end date of the period to retrieve the results for (YYYY-MM-DD)
	 *       - in: path
	 *         name: sound
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The sound to retrieve the results for (e.g. 'sound1', 'sound2')
	 *     responses:
	 *       200:
	 *         description: The average monthly results for the given patient and game
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   daysLogged:
	 *                     type: integer
	 *                     description: The number of days with logged results for this month
	 *                   results:
	 *                     type: object
	 *                     properties:
	 *                       month-year:
	 *                         type: string
	 *                         description: The month and year of the average results (e.g. '01-2022')
	 *                       metric1:
	 *                         type: number
	 *                         description: The average value of metric1 for this month
	 *                       metric2:
	 *                         type: number
	 *                         description: The average value of metric2 for this month
	 *       204:
	 *         description: No content available for the given parameters
	 *       500:
	 *         description: Internal server error
	 */

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
	/**
	 * @swagger
	 * /api/games/{gameId}/results/average/year/{patientId}:
	 *   get:
	 *     summary: Get average results for a game by year for a patient
	 *     description: Returns the average results for a game by year for a given patient ID and game ID within a specified date range.
	 *     tags:
	 *       - GameResults
	 *     parameters:
	 *       - in: path
	 *         name: gameId
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The ID of the game.
	 *       - in: path
	 *         name: patientId
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The ID of the patient.
	 *       - in: query
	 *         name: initialDate
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The initial date for the search in YYYY-MM-DD format.
	 *       - in: query
	 *         name: finalDate
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The final date for the search in YYYY-MM-DD format.
	 *       - in: query
	 *         name: sound
	 *         schema:
	 *           type: string
	 *         required: false
	 *         description: The sound used in the game.
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: Average results for a game by year for a patient
	 *         schema:
	 *           type: array
	 *           items:
	 *             type: object
	 *             properties:
	 *               daysLogged:
	 *                 type: number
	 *                 description: The number of days logged for the patient.
	 *               results:
	 *                 type: object
	 *                 properties:
	 *                   year:
	 *                     type: string
	 *                     description: The year.
	 *                   [resultKey]:
	 *                     type: number
	 *                     description: The average result for the specified key.
	 *               description: The average results for the specified year.
	 *       204:
	 *         description: No content found for the specified query.
	 *       500:
	 *         description: Internal server error.
	 */

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
