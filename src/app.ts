import Controller from './controllers/controller';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import notFoundErrorMiddleware from './middlewares/NotFoundErrorMiddleware';
import runTimeErrorMiddleware from './middlewares/RunTimeErrorMiddleware';
import userNotFoundErrorMiddleware from './middlewares/UserNotFoundErrorMiddleware';

class App {
	public app: express.Application;

	public constructor(controllers: Controller[]) {
		this.app = express();
		this.app.use(cors());

		this.initMongoose();
		this.connectDatabase();
		this.initExpressJson();
		this.initControllers(controllers);
		this.initNotFoundErrorMiddleware();
		this.initUserNotFoundErrorMiddleware();
		this.initRunTimeErrorMiddleware();
	}

	private initMongoose(): void {
		mongoose.set('runValidators', true);
	}

	private connectDatabase(): void {
		mongoose.connect(
			'mongodb+srv://projetotccmongodb:projeto2023@cluster0.wzsdo8s.mongodb.net/projetotcc?retryWrites=true&w=majority',
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
				useCreateIndex: true,
			}
		);
	}

	private initExpressJson(): void {
		this.app.use(express.json());
	}

	private initControllers(controllers: Controller[]): void {
		controllers.forEach((controller) => {
			this.app.use('/', controller.router);
		});
	}

	private initNotFoundErrorMiddleware() {
		this.app.all('*', notFoundErrorMiddleware);
	}

	private initUserNotFoundErrorMiddleware() {
		this.app.all('*', userNotFoundErrorMiddleware);
	}

	private initRunTimeErrorMiddleware() {
		this.app.use(runTimeErrorMiddleware);
	}

	public listen(port: number): void {
		this.app.listen(port, () => {
			console.log(`Aplicação iniciada na porta: ${port}`);
		});
	}
}

export default App;
