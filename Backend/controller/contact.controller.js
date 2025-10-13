const express = require('express');
const { sendEmail } = require('../service/nodemailer');

const contactUs = async (req, res) =>{
    try {
        const {name, email, message} = req.body;
        if(!name || !email || !message){
            return res.status(400).json({success: false, message: "All fields are required"});
        }

        await sendEmail({
          to: process.env.EMAIL_USER,
          subject: `Contact Us Message from ${name}`,
          html: `<h1>Contact Us Message</h1>
                   <p><strong>From:</strong> ${name} ${email}</p>
                    <p>${message.replace(/\n/g, "<br>")}</p>`,
        });


        await sendEmail({
          to: email,
          subject: "We Received Your Message!",
          html: `<p>Hi ${name},</p><p>Thank you for reaching out! We'll get back to you soon.</p>`,
        });

        return res.status(200).send({Message: "Message sent successfully"});
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

module.exports = {contactUs};