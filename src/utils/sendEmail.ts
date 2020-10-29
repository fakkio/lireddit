import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, html: string) {
  // const testAccount = await nodemailer.createTestAccount();
  // console.log({testAccount});

  const testAccount = {
    user: "rgau3qrkhvhox57n@ethereal.email",
    pass: "1efSA2zmfntS9pbm1Z",
    smtp: {host: "smtp.ethereal.email", port: 587, secure: false},
    imap: {host: "imap.ethereal.email", port: 993, secure: true},
    pop3: {host: "pop3.ethereal.email", port: 995, secure: true},
    web: "https://ethereal.email",
  };

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to,
    subject: "Change password",
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
