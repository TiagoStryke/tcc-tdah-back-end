import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import Game from '../schemas/Game';
import NoContentException from '../errors/NoContentException';
import ServerErrorException from '../errors/ServerErrorException';
import responseCreate from '../responses/ResponseCreate';
import responseOk from '../responses/ResponseOk';

class GameController extends Controller {
	constructor() {
		super('/game');
	}
	protected initRoutes(): void {
		this.router.get(this.path, this.list);
		this.router.post(this.path, this.create);
		this.router.delete(`${this.path}/:id`, this.delete);
	}

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
