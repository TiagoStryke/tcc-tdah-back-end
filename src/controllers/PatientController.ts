import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import NoContentException from '../errors/NoContentException';
import Patient from '../schemas/Patient';
import ServerErrorException from '../errors/ServerErrorException';
import responseCreate from '../responses/ResponseCreate';
import responseOk from '../responses/ResponseOk';

class PatientController extends Controller {
	constructor() {
		super('/patient');
	}
	protected initRoutes(): void {
		this.router.get(this.path, this.list);
		this.router.post(this.path, this.create);
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

	private async create(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const patient = await Patient.create(req.body);

			return responseCreate(res, patient);
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
}

export default PatientController;
