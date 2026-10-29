/* eslint-disable camelcase */
import amqp from 'amqplib';

const getAmqpUrl = () => {
  if (process.env.AMQP_URL) return process.env.AMQP_URL;

  const host = process.env.RABBITMQ_HOST;
  const port = process.env.RABBITMQ_PORT || 5672;
  const user = process.env.RABBITMQ_USER;
  const password = process.env.RABBITMQ_PASSWORD;

  if (user && password) {
    return `amqp://${user}:${password}@${host}:${port}`;
  }

  return `amqp://${host}:${port}`;
};

export const QUEUE_NAME = 'applications:new';

const ApplicationQueueService = {
  publishNewApplication: async (applicationId) => {
    const connection = await amqp.connect(getAmqpUrl());
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({ application_id: applicationId })));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

export default ApplicationQueueService;