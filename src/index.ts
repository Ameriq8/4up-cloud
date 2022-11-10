import logger from '@utils/logger';
import routes from '@v1/routes';
import express from 'express';
import config from './config';
import helmet from 'helmet';
import cors from 'cors';

const PORT = config.PORT || 5000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use('/api/v1', routes);
app.use(async (_, res) => {
  res.status(404).json({
    message: 'Not Found',
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`Listening to ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  logger.error(err);
});
process.on('uncaughtException', (err) => {
  logger.error(err);
});
