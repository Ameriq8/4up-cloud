import logger from '@utils/logger';
import routes from '@v1/routes';
import express from 'express';
import config from './config';
// import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

const PORT = config.port || 5000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
// app.use(morgan('dev'));
app.use(cors());
app.use('/api/v1', routes);
app.use((_, res) => {
  res.status(404).json({
    message: 'Not Found',
  });
});

app.listen(PORT, async () => {
  logger.info(`Listening to ${PORT}`);
});

export default app;

process.on('unhandledRejection', (err) => {
  logger.error(err);
});
process.on('uncaughtException', (err) => {
  logger.error(err);
});
