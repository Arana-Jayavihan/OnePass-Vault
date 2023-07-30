import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const sendMails = async (mail) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'onepassvault@gmail.com',
                pass: process.env.MAIL_USER_PASS
            },
            secure: true,
            requireTLS: true
        })

        const mailData = {
            from: '"OnePass Vault" onepassvault@gmail.com',
            to: mail.to,
            subject: mail.subject,
            text: mail.body,
            attachments: mail.attachments,
            html: mail.html
        }

        transporter.sendMail(mailData, async (error, info) => {
            if (error) {
                console.log(error)
            }
            else if (info) {
                console.log(info)
                console.log("Mail Sent")
                return true
            }
        })
    }
    catch (error) {
        console.log(error)
    }
}
