import nodemailer from 'nodemailer';

const nodemailerTransport = nodemailer.createTransport({
    host:"smtp.hostinger.com",
    port: 465,
    secure: true,
    secureConnection: false,
    tls:{
      ciphers: 'SSLv3',
    },
    auth: {
      user: 'contact@gabtrotter.org',
      pass: 'Azerty2022@@*',
    },
  });

export default nodemailerTransport;