import { Document, Schema, model } from 'mongoose';

import { GameInterface } from './Game';
import { PatientInterface } from './Patient';

export interface GameResultInterface extends Document {
	game: GameInterface;
	patient: PatientInterface;
	results: object;
	date: Date;
}

const GameResultSchema = new Schema(
	{
		gameId: {
			type: Schema.Types.ObjectId,
			ref: 'Game',
			required: [true, 'Game é obrigatório'],
		},
		patientId: {
			type: Schema.Types.ObjectId,
			ref: 'Patient',
			required: [true, 'Paciente é obrigatório'],
		},
		results: {
			type: Object,
			required: [true, 'Resultados são obrigatórios'],
		},
		date: {
			type: Date,
			default: Date.now,
			required: [true, 'Data é obrigatória'],
		},
	},
	{ versionKey: false }
);

export default model<GameResultInterface>('GameResult', GameResultSchema);
