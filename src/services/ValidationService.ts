import IdInvalidException from '../errors/IdInvalidException';
import { NextFunction } from 'express';
import { Types } from 'mongoose';

class ValidationService {
	public validateId(id: string, next: NextFunction): boolean {
		if (!Types.ObjectId.isValid(id)) {
			next(new IdInvalidException());
			return true;
		}
		return false;
	}
}

export default new ValidationService();
