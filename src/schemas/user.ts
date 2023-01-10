import { Document, Schema, model } from 'mongoose';

export interface UserInterface extends Document {
	name: string;
	email: string;
	password: string;
	createdAt: Date;
}

const UserSchema = new Schema(
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
		password: {
			type: String,
			required: [true, 'Senha obrigatória'],
			select: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ versionKey: false }
);

export default model<UserInterface>('User', UserSchema);
