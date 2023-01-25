import { Document, Schema, model } from 'mongoose';

import { UserInterface } from './User';

export interface PatientInterface extends Document {
	name: string;
	email: string;
	birthDate: Date;
	codLogin: string;
	diagnosisDate: Date;
	otherComorbidities: string;
	createdAt: Date;
	responsible: UserInterface;
}

const PatientSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Nome obrigatório'],
		},
		email: {
			type: String,
			required: [true, 'E-mail obrigatório'],
			unique: true,
			lowercase: true,
		},
		birthDate: {
			type: Date,
			required: [true, 'Data de nascimento obrigatória'],
		},
		codLogin: {
			type: String,
			unique: true,
			required: [true, 'Código de login obrigatório'],
		},
		diagnosisDate: {
			type: Date,
			required: [true, 'Data de diagnóstico obrigatória'],
		},
		otherComorbidities: {
			type: String,
			required: [true, 'Outras comorbidades obrigatórias'],
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		responsible: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ versionKey: false }
);

export default model<PatientInterface>('Patient', PatientSchema);
