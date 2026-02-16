import dotnev from 'dotenv';
import { initServer } from "./configs/app.js";

dotnev.config();
initServer();