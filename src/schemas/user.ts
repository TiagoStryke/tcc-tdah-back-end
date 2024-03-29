import { Document, Schema, model } from 'mongoose';

import DefaultProfilePhoto from '../helpers/Defaultb64ProfilePhoto';
import bcrypt from 'bcrypt';

export interface UserInterface extends Document {
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	generatedCodes: string[];
	profilePhoto: string;
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
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		generatedCodes: {
			type: [String],
			default: [],
		},
		profilePhoto: {
			type: String,
			required: false,
			default: DefaultProfilePhoto,
		},
		privilege: {
			type: String,
			default: 'user',
		},
	},
	{ versionKey: false }
);

UserSchema.pre<UserInterface>('save', async function (next) {
	const user = this;
	if (!user.isModified('password')) {
		return next();
	}
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	next();
});

export default model<UserInterface>('User', UserSchema);
