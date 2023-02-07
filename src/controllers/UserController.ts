import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import NoContentException from '../errors/NoContentException';
import ServerErrorException from '../errors/ServerErrorException';
import User from '../schemas/User';
import UserNotFoundErrorMiddleware from '../middlewares/UserNotFoundErrorMiddleware';
import ValidationService from '../services/ValidationService';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import notFoundErrorMiddleware from '../middlewares/NotFoundErrorMiddleware';
import responseCreate from '../responses/ResponseCreate';
import responseOk from '../responses/ResponseOk';

dotenv.config({
	path: __dirname + '/../.env',
});
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
		this.router.post(`${this.path}/login`, this.login);
	}

	private async login(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		const { email, password } = req.body;
		const secret = process.env.JWT_SECRET;
		try {
			const user = await User.findOne({ email });

			if (!user) {
				return notFoundErrorMiddleware(req, res);
			}
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return UserNotFoundErrorMiddleware(req, res);
			}

			// Generate a JSON Web Token
			const token = jwt.sign({ userId: user._id }, secret, {
				expiresIn: '1d',
			});

			// Return the token in the response
			return res.send({ token });
		} catch (error) {
			console.log(error);
			next(new ServerErrorException(error));
		}
	}

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

			const user = await User.findById(id);
			if (!user) {
				next(new NoContentException());
				return;
			}

			if (req.body.password) {
				const salt = await bcrypt.genSalt(10);
				user.password = await bcrypt.hash(req.body.password, salt);
			}

			if (req.body.profilePhoto) {
				user.profilePhoto = req.body.profilePhoto;

				await user.save();
			}

			if (user) {
				Object.assign(user, req.body);
				await user.save();

				return responseOk(res, user);
			}

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
			if (generatedCode === undefined) {
				return;
			}

			if (ValidationService.validateId(id, next)) return;

			const user = await User.findByIdAndUpdate(id, {
				$push: { generatedCodes: { $each: generatedCode, $slice: -10 } },
			});

			if (user) {
				return responseOk(res, user);
			}

			next(new NoContentException());
		} catch (error) {
			console.log(error);
			next(new ServerErrorException(error));
		}
	}
}

export default UserController;
