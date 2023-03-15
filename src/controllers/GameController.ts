import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import Game from '../schemas/Game';
import NoContentException from '../errors/NoContentException';
import ServerErrorException from '../errors/ServerErrorException';
import responseCreate from '../responses/ResponseCreate';
import responseOk from '../responses/ResponseOk';

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: API for managing games
 */
class GameController extends Controller {
	constructor() {
		super('/game');
	}
	protected initRoutes(): void {
		this.router.get(this.path, this.list);
		this.router.post(this.path, this.create);
		this.router.delete(`${this.path}/:id`, this.delete);
	}
	/**
	 * @swagger
	 * /game:
	 *   post:
	 *     summary: Create a new game
	 *     tags: [Games]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 description: The name of the game
	 *               resultsStructure:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: The structure of the game results
	 *     responses:
	 *       201:
	 *         description: Created
	 *       500:
	 *         description: Internal Server Error
	 */
	private async create(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { name, resultsStructure } = req.body;
			const game = await Game.create({ name, resultsStructure });
			return responseCreate(res, game);
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
	/**
	 * @swagger
	 * /game/{id}:
	 *   delete:
	 *     summary: Delete a game by ID
	 *     tags: [Games]
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *         description: The ID of the game to delete
	 *     responses:
	 *       200:
	 *         description: OK
	 *       204:
	 *         description: No Content
	 *       500:
	 *         description: Internal Server Error
	 */
	private async delete(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { id } = req.params;
			const game = await Game.findByIdAndDelete(id);
			if (!game) {
				next(new NoContentException());
				return;
			}
			return responseOk(res, game);
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
	/**
	 * @swagger
	 * /game:
	 *   get:
	 *     summary: Get all games
	 *     tags: [Games]
	 *     responses:
	 *       200:
	 *         description: OK
	 *       204:
	 *         description: No Content
	 *       500:
	 *         description: Internal Server Error
	 */
	private async list(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const games = await Game.find();
			if (games.length) return responseOk(res, games);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
}

export default GameController;
