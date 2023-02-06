import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import NoContentException from '../errors/NoContentException';
import ServerErrorException from '../errors/ServerErrorException';
import User from '../schemas/User';
import ValidationService from '../services/ValidationService';
import responseCreate from '../responses/ResponseCreate';
import responseOk from '../responses/ResponseOk';

class UserController extends Controller {
	constructor() {
		super('/user');
	}

	protected initRoutes(): void {
		this.router.get(this.path, this.list);
		this.router.get(`${this.path}/:id`, this.findById);
		this.router.post(this.path, this.create);
		this.router.put(`${this.path}/:id`, this.edit);
		this.router.delete(`${this.path}/:id`, this.delete);
		this.router.put(`${this.path}/:id/code`, this.insertGeneratedCode);
		// this.router.post(`${this.path}/login`, this.login);
	}

	// private async login(
	// 	req: Request,
	// 	res: Response,
	// 	next: NextFunction
	// ): Promise<Response | undefined> {
	// 	try{

	// 	}catch(error){
	// 		next(new ServerErrorException(error));
	// 	}
	// }

	private async list(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const users = await User.find();

			if (users.length) return responseOk(res, users);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}

	private async findById(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { id } = req.params;
			if (ValidationService.validateId(id, next)) return;

			const user = await User.findById(id);
			if (user) return responseOk(res, user);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}

	private async create(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const user = await User.create(req.body);

			return responseCreate(res, user);
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}

	private async edit(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { id } = req.params;
			if (ValidationService.validateId(id, next)) return;

			const user = await User.findByIdAndUpdate(id, req.body, () => {});
			if (user) return responseOk(res, user);

			next(new NoContentException());
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
			if (ValidationService.validateId(id, next)) return;

			const user = await User.findById(id);
			if (user) {
				user.deleteOne();
				return responseOk(res, user);
			}

			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}

	private async insertGeneratedCode(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { id } = req.params;
			const { generatedCode } = req.body;
			if (generatedCode === undefined) return;

			if (ValidationService.validateId(id, next)) return;

			const user = await User.findByIdAndUpdate(
				id,
				{ $push: { generatedCodes: generatedCode } },
				() => {}
			);

			// const user = await User.findById(id);

			if (user) {
				if (user.generatedCodes.length >= 10) {
					user.generatedCodes.splice(0, user.generatedCodes.length - 10);
					await user.save();
				}
				return responseOk(res, user);
			}

			// if (user) return responseOk(res, user);

			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
}

export default UserController;
