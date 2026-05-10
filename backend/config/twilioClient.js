import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Lazy-initialize Twilio client (only when actually called)
// This prevents server crash when credentials are not yet configured
let _client = null;

const getClient = () => {
    if (!_client) {
        if (!accountSid || !authToken || !accountSid.startsWith('AC')) {
            throw new Error(
                'Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env'
            );
        }
        _client = twilio(accountSid, authToken);
    }
    return _client;
};

/**
 * Send a plain SMS message
 * @param {Object} options - { to, body }
 */
export const sendSMS = async ({ to, body }) => {
    try {
        const client = getClient();
        const message = await client.messages.create({
            body,
            from: twilioPhone,
            to,
        });
        console.log(`📱 SMS sent: ${message.sid}`);
        return message;
    } catch (error) {
        console.error('❌ SMS send failed:', error.message);
        throw error;
    }
};

/**
 * Send OTP via Twilio Verify Service
 * @param {string} phoneNumber - E.164 format phone number
 */
export const sendOTP = async (phoneNumber) => {
    try {
        const client = getClient();
        const verification = await client.verify.v2
            .services(verifyServiceSid)
            .verifications.create({
                to: phoneNumber,
                channel: 'sms',
            });
        console.log(`📱 OTP sent to ${phoneNumber}: ${verification.status}`);
        return verification;
    } catch (error) {
        console.error('❌ OTP send failed:', error.message);
        throw error;
    }
};

/**
 * Verify OTP via Twilio Verify Service
 * @param {string} phoneNumber - E.164 format phone number
 * @param {string} code - The OTP code entered by user
 */
export const verifyOTP = async (phoneNumber, code) => {
    try {
        const client = getClient();
        const verificationCheck = await client.verify.v2
            .services(verifyServiceSid)
            .verificationChecks.create({
                to: phoneNumber,
                code,
            });
        console.log(`📱 OTP verification: ${verificationCheck.status}`);
        return verificationCheck;
    } catch (error) {
        console.error('❌ OTP verification failed:', error.message);
        throw error;
    }
};
