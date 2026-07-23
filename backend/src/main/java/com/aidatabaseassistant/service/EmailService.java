package com.aidatabaseassistant.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender javaMailSender;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        // ALWAYS log the OTP to the console so we can test locally without needing a real email account
        logger.info("==================================================");
        logger.info("MOCK EMAIL OTP INTERCEPTED FOR: {}", toEmail);
        logger.info("OTP CODE: {}", otp);
        logger.info("==================================================");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Your OTP for AI Database Assistant");
            message.setText("Welcome to AI Database Assistant! Your OTP for registration is: " + otp + "\nThis OTP is valid for 10 minutes.");
            javaMailSender.send(message);
            logger.info("Successfully sent OTP email to {}", toEmail);
        } catch (Exception e) {
            logger.warn("Failed to send real email to {}. But you can use the OTP logged above for testing! Error: {}", toEmail, e.getMessage());
        }
    }
}
