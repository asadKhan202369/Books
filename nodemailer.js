const nodemailer = require("nodemailer");
const googleApis = require("googleapis");

const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const CLIENT_ID = `812480260222-jmv8n1d9ifdjnie9eejl95i9inpe8c17.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//04PzZ-P3Yz72pCgYIARAAGAQSNwF-L9Ir0EeefOvQrhhlBuIAc-87UU8QWnjipWOxAQYnCSe6vNBub--KlXIwbgU9IBrY5kd5doM`;
const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
authClient.setCredentials({
    refresh_token: REFRESH_TOKEN
});
async function mailer(email, userid,username, token) {
    try {
        const ACCESS_TOKEN = await authClient.getAccessToken();
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "ak1933929@gmail.com",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN
            }
        })

        const details = {
            from: "Asad <ak1933929@gmail.com>",
            to: email,
            subject: "Reset Your Website Password",
            text: `${userid}`,
            html:`
                Dear ${username},
                <p style="font-size: .9vmax;">
                We received a request to reset your password for your account at [Shery Ride]. If you did not make this request, you can ignore this email; <br> your account is safe and your password remains unchanged.
                </p>
                <h6 style="font-size: 1vmax;"> To reset your password, please click the following link (or copy and paste it into your web browser):</h6>
                <a style="background-color: rgba(0, 0, 255, 0.619);color: #fff;padding: .7vmax 1vmax;display: flex;align-items: center;justify-content: center;width: fit-content;border-radius:5px;letter-spacing: 1px;text-decoration: none;"  href="http://127.0.0.1:3000/reset/${userid}/${token}">Reset Link</a>

                <br>
                <small style="font-size: .8vmax;">
                    Please note that this reset link/code is valid for a limited time. If you do not complete the <br>  password reset process within [expiration time, e.g., 1 hour], you will need to submit a <br> new forgot password request.
                </small>
                <h6 style="font-size: 1vmax;">If you have any questions or need further assistance, please do not hesitate to contact our support team at <br> [ak1933929@gmail.com/8962834895].</h6>
                Thank you,
                <br>
                Shery Ride Team
                <br>
                [Your Website URL]
            `
        
        }
        const result = await transport.sendMail(details);
        return result;
    } catch (err) {
        return err;
    }
}
 
module.exports = mailer;