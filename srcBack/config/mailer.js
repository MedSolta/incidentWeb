import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mohamedsoltani448@gmail.com',
        pass: 'ldnc fiko lijz yedh'
    }
});
export default transporter;