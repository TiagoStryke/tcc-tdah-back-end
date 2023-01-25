import App from './app';
import PatientController from './controllers/PatientController';
import UserController from './controllers/UserController';

const app = new App([new UserController(), new PatientController()]);

app.listen(3333);
