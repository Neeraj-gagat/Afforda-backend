import { SES } from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const ses = new SES({ 
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

});


export async function sendResetPasswordEmail(email: string, resetLink: string) {
  return ses.sendEmail({
    Source: "no-reply@affoda.com",
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Reset Your Password" },
      Body: {
        Html: {
          Data: `Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.`
        }
      }
    }
  }).promise();
}


export async function sendVerificationEmail(email:string, verificationLink:string){

  const result = await ses.sendEmail({
    Source: "no-reply@affoda.com",
    Destination: { ToAddresses: [email] },
    Message: {
        Subject: { Data: "Verify your email" },
        Body: {
            Html: {
                Data: `Click <a href="${verificationLink}">here</a> to verify your email. This link will expire in 1 hour.`
            }
        }
    }
  }).promise();

  return result;

}