import express, { Request, Response } from 'express';
import { config } from './config/env';

const app = express();
const port = process.env.PORT || config.PORT;
app.use(express.json());

app.listen(port , () => {
    console.log('server is running on port ' + port );
})