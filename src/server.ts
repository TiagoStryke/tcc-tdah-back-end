import App from './app';
import GameController from './controllers/GameController';
import GameResultController from './controllers/GameResultController';
import PatientController from './controllers/PatientController';
import UserController from './controllers/UserController';

const app = new App([
	new UserController(),
	new PatientController(),
	new GameController(),
	new GameResultController(),
]);

app.listen(3333);
