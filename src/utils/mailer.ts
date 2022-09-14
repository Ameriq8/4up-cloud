import mailer from '@sendgrid/mail';
import config from '@root/config';
import logger from '@utils/logger';
mailer.setApiKey(config.SENDGRID_API_KEY);

export const welcomeEmail = async (email: string, username: string) => {
  const msg = {
    to: email,
    from: config.MAILER_DOMAIN,
    subject: 'Welcome to DevCrew',
    text: `Hi ${username}, welcome to DevCrew!`,
    html: `<p>Hi ${username},</p>
        <p>Welcome to DevCrew Community.</p>
        <p>Thank you for your Register</p>`,
  };
  await mailer
    .send(msg)
    .then(() => logger.info('Welcome email sent'))
    .catch((err) => logger.error("Couldn't send welcome email", err));
};

export const forgetPasswordEmail = async (email: string, token: string) => {
  const msg = {
    to: email,
    from: config.MAILER_DOMAIN,
    subject: 'Reset Password',
    text: `Hello, reset your password.`,
    html: `<p>Hi,</p>
        <p>Please click on the link below to reset your password.</p>
        <p>${config.APP_URL}/forget-password/${token}</p>`,
  };
  await mailer
    .send(msg)
    .then(() => logger.info('Forget password email sent'))
    .catch((err) => logger.error("Couldn't send forget password email", err));
};

export const verifyAccountEmail = async (email: string, token: string) => {
  const msg = {
    to: email,
    from: config.MAILER_DOMAIN,
    subject: 'Verify your account',
    text: `Hello, verify your account.`,
    html: `<p>Hi,</p>
            <p>Please click on the link below to verify your account.</p>
            <p>${config.APP_URL}/verify/${token}</a>`,
  };
  await mailer
    .send(msg)
    .then(() => logger.info('Verify account email sent'))
    .catch((err) => logger.error("Couldn't send verify account email", err));
};
