import 'dotenv/config';
import amqp from 'amqplib';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';

const pool = new Pool();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

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

const QUEUE_NAME = 'applications:new';

const getApplicationNotificationData = async (applicationId) => {
  const query = {
    text: `
      SELECT
        applications.created_at AS application_date,
        applicant.name AS applicant_name,
        applicant.email AS applicant_email,
        jobs.title AS job_title,
        owner.email AS owner_email,
        owner.name AS owner_name
      FROM applications
      JOIN users applicant ON applicant.id = applications.user_id
      JOIN jobs ON jobs.id = applications.job_id
      JOIN companies ON companies.id = jobs.company_id
      JOIN users owner ON owner.id = companies.owner
      WHERE applications.id = $1
    `,
    values: [applicationId],
  };

  const result = await pool.query(query);
  return result.rows[0];
};

const start = async () => {
  const connection = await amqp.connect(getAmqpUrl());
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });

  console.log(`Consumer siap, menunggu pesan dari queue "${QUEUE_NAME}"...`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const { application_id: applicationId } = JSON.parse(msg.content.toString());
      const data = await getApplicationNotificationData(applicationId);

      if (!data) {
        console.error(`Data untuk application ${applicationId} tidak ditemukan`);
        channel.ack(msg);
        return;
      }

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: data.owner_email,
        subject: `Lamaran Baru untuk ${data.job_title}`,
        text: `Halo ${data.owner_name},

Ada kandidat baru yang melamar untuk posisi "${data.job_title}".

Nama Pelamar  : ${data.applicant_name}
Email Pelamar : ${data.applicant_email}
Tanggal Lamar : ${data.application_date}

Silakan tinjau lamaran tersebut di dashboard OpenJob.`,
      });

      console.log(`Email notifikasi terkirim ke ${data.owner_email}`);
      channel.ack(msg);
    } catch (error) {
      console.error('Gagal memproses pesan:', error.message);
      channel.ack(msg);
    }
  });
};

start().catch((error) => {
  console.error('Consumer gagal dijalankan:', error);
  process.exit(1);
});