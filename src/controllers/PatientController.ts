import { NextFunction, Request, Response } from 'express';

import Controller from './Controller';
import NoContentException from '../errors/NoContentException';
import Patient from '../schemas/Patient';
import ServerErrorException from '../errors/ServerErrorException';
import User from '../schemas/User';
import ValidationService from '../services/ValidationService';
import responseCreate from '../responses/ResponseCreate';
import responseOk from '../responses/ResponseOk';

/**
 * PatientController class
 * @swagger
 * tags:
 *   name: Patient
 *   description: API for managing patients
 */
class PatientController extends Controller {
	constructor() {
		super('/patient');
	}
	protected initRoutes(): void {
		this.router.get(this.path, this.list);
		this.router.post(this.path, this.create);
		this.router.get(`${this.path}/responsible/:id`, this.listByResponsibleId);
		this.router.delete(`${this.path}/:id`, this.delete);
	}
	/**
	 * @swagger
	 * /patient:
	 *   get:
	 *     summary: Get all patients
	 *     tags: [Patient]
	 *     responses:
	 *       200:
	 *         description: Returns an array of patients
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 $ref: '#/components/schemas/Patient'
	 *       204:
	 *         description: No patients found
	 *       500:
	 *         description: Server error
	 */
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
	/**
	 * @swagger
	 * /patient/responsible/{id}:
	 *   get:
	 *     summary: Get all patients assigned to a responsible user
	 *     tags: [Patient]
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         required: true
	 *         schema:
	 *           type: string
	 *         description: ID of the responsible user
	 *     responses:
	 *       200:
	 *         description: Returns an array of patients
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 $ref: '#/components/schemas/Patient'
	 *       204:
	 *         description: No patients found for the responsible user
	 *       500:
	 *         description: Server error
	 */
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
	/**
	 * Deletes a patient by ID.
	 * @swagger
	 * /patient/{id}:
	 *   delete:
	 *     summary: Deletes a patient by ID.
	 *     description: Deletes a patient by ID.
	 *     tags:
	 *       - Patient
	 *     parameters:
	 *       - in: path
	 *         name: id
	 *         description: ID of the patient to delete.
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       200:
	 *         description: The deleted patient.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/Patient'
	 *       204:
	 *         description: No patient found for the given ID.
	 *       500:
	 *         description: Internal server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ServerErrorException'
	 */
	private async delete(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response | undefined> {
		try {
			const { id } = req.params;
			if (ValidationService.validateId(id, next)) return;

			const patient = await Patient.findById(id);
			if (patient) {
				patient.deleteOne();
				return responseOk(res, patient);
			}

			next(new NoContentException());
		} catch (error) {
			next(new ServerErrorException(error));
		}
	}
	/**
	 * @swagger
	 * /patient:
	 *   post:
	 *     summary: Create a new patient
	 *     tags: [Patient]
	 *     requestBody:
	 *       description: Patient object to be created
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             $ref: '#/components/schemas/PatientRequest'
	 *     responses:
	 *       201:
	 *         description: Returns the created patient
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/Patient'
	 *       204:
	 *         description: User not found
	 *       500:
	 *         description: Server error
	 */
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
