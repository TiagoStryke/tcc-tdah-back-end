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
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */
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
	/**
	 * @swagger
	 * /user/login:
	 *   post:
	 *     summary: Login to the application
	 *     tags:
	 *       - Authentication
	 *     requestBody:
	 *       description: User credentials to authenticate
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               email:
	 *                 type: string
	 *                 format: email
	 *               password:
	 *                 type: string
	 *                 format: password
	 *             example:
	 *               email: john@example.com
	 *               password: password123
	 *     responses:
	 *       200:
	 *         description: Returns a JSON Web Token
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 token:
	 *                   type: string
	 *                   description: JSON Web Token
	 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
	 *       401:
	 *         $ref: '#/components/responses/UnauthorizedError'
	 *       500:
	 *         $ref: '#/components/responses/InternalServerError'
	 */

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
	/**
	 * @swagger
	 * /user:
	 *   get:
	 *     summary: Retrieves a list of all users.
	 *     tags:
	 *       - Users
	 *     responses:
	 *       200:
	 *         description: A list of users.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 $ref: '#/components/schemas/User'
	 *       204:
	 *         description: No users found.
	 *     security:
	 *       - bearerAuth: []
	 */
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
	/**
	 * @swagger
	 * /user/{id}:
	 *   get:
	 *     summary: Get a user by ID
	 *     tags: [Users]
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: User ID
	 *     responses:
	 *       200:
	 *         description: Success
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/User'
	 *       204:
	 *         description: No content found for the specified ID
	 *     security:
	 *       - bearerAuth: []
	 */
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
	/**
	 * @swagger
	 * /user:
	 *   post:
	 *     summary: Create a new user.
	 *     requestBody:
	 *       description: User object that needs to be created.
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             $ref: '#/components/schemas/User'
	 *     tags:
	 *       - Users
	 *     responses:
	 *       201:
	 *         description: User created successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/User'
	 *       500:
	 *         description: Internal server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/Error'
	 */

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
	/**
	 * Update an existing user by ID
	 *
	 * @swagger
	 * /user/{id}:
	 *   put:
	 *     summary: Update an existing user by ID
	 *     tags:
	 *       - Users
	 *     parameters:
	 *       - name: id
	 *         in: path
	 *         description: ID of the user to update
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: password
	 *         in: body
	 *         description: New password for the user (optional)
	 *         required: false
	 *         schema:
	 *           type: object
	 *           properties:
	 *             password:
	 *               type: string
	 *       - name: profilePhoto
	 *         in: body
	 *         description: New profile photo for the user (optional)
	 *         required: false
	 *         schema:
	 *           type: object
	 *           properties:
	 *             profilePhoto:
	 *               type: string
	 *     responses:
	 *       '200':
	 *         description: User updated successfully
	 *         schema:
	 *           $ref: '#/definitions/User'
	 *       '204':
	 *         description: No user found for the given ID
	 *       '500':
	 *         description: Internal server error
	 */
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
	/**
	 * @swagger
	 * /user/{id}:
	 *   delete:
	 *     summary: Delete a user by ID
	 *     description: Delete a user by ID
	 *     tags: [Users]
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: ID of the user to delete
	 *     responses:
	 *       200:
	 *         description: User deleted successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   description: ID of the deleted user
	 *                 email:
	 *                   type: string
	 *                   description: Email of the deleted user
	 *                 password:
	 *                   type: string
	 *                   description: Hashed password of the deleted user
	 *                 profilePhoto:
	 *                   type: string
	 *                   description: URL of the profile photo of the deleted user
	 *                 createdAt:
	 *                   type: string
	 *                   description: Date of creation of the deleted user
	 *                 updatedAt:
	 *                   type: string
	 *                   description: Date of last update of the deleted user
	 *       204:
	 *         description: No content found with the specified ID
	 *       500:
	 *         description: Server error
	 */
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
	/**
	 * @swagger
	 * /user/{id}/generated-code:
	 *   post:
	 *     summary: Insert generated code for a user.
	 *     description: Inserts an array of generated codes for a specific user. The generated codes array will be limited to 10 items, keeping only the last 10 codes added.
	 *     tags:
	 *       - Users
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         schema:
	 *           type: string
	 *         required: true
	 *         description: The ID of the user to insert the generated codes for.
	 *       - in: body
	 *         name: generatedCode
	 *         schema:
	 *           type: array
	 *           items:
	 *             type: string
	 *         required: true
	 *         description: An array of generated codes to insert for the user.
	 *     responses:
	 *       200:
	 *         description: The updated user with the new generated codes array.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/User'
	 *       204:
	 *         description: The requested user was not found.
	 *       500:
	 *         description: An error occurred while processing the request.
	 */

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
