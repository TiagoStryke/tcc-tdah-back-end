import { Document, Schema, model } from 'mongoose';

export interface GameInterface extends Document {
	name: string;
	resultsStructure: {
		fieldName: string;
		fieldType: string;
		portugueseTitle: string;
	}[];
}

const GameSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Nome obrigatório'],
		},
		resultsStructure: [
			{
				fieldName: {
					type: String,
					required: [true, 'Nome do campo obrigatório'],
				},
				fieldType: {
					type: String,
					required: [true, 'Tipo do campo obrigatório'],
				},
				measuredIn: {
					type: String,
					required: [true, 'Unidade de medida obrigatória'],
				},
				portugueseTitle: {
					type: String,
					required: [true, 'Título em português obrigatório'],
				},
			},
		],
	},
	{ versionKey: false }
);

export default model<GameInterface>('Game', GameSchema);
