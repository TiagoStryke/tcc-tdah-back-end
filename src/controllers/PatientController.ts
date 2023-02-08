import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import NoContentException from '../errors/NoContentException';
import Patient from '../schemas/Patient';
import ServerErrorException from '../errors/ServerErrorException';
import User from '../schemas/User';
import ValidationService from '../services/ValidationService';
import responseCreate from '../responses/ResponseCreate';
import responseOk from '../responses/ResponseOk';

class PatientController extends Controller {
	constructor() {
		super('/patient');
	}
	protected initRoutes(): void {
		this.router.get(this.path, this.list);
		this.router.post(this.path, this.create);
		this.router.get(`${this.path}/responsible/:id`, this.listByResponsibleId);
	}

	private async list(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const patients = await Patient.find();

			if (patients.length) return responseOk(res, patients);
			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}

	private async listByResponsibleId(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { id } = req.params;
			let patients: any = [];
			if (ValidationService.validateId(id, next)) return;

			const responsibleUser = await User.findById(id);
			if (!responsibleUser) next(new NoContentException());
			if (responsibleUser) {
				patients = await Patient.find({
					responsible: responsibleUser._id,
				}).sort({ name: 1 });
			}

			if (patients) return responseOk(res, patients);
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
			const user = await User.findOne({ generatedCodes: req.body.codLogin });
			if (!user) {
				next(new NoContentException());
				return;
			}
			const userIndex = user.generatedCodes.indexOf(req.body.codLogin);

			const patient = await Patient.create({
				...req.body,
				responsible: user._id,
			});

			user.generatedCodes.splice(userIndex, 1);
			await user.save();

			return responseCreate(res, patient);
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
}

export default PatientController;
