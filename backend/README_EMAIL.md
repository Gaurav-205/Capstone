# Email Configuration Guide for KampusKart

This guide explains how to set up the email functionality for the password reset and OTP (One-Time Password) system in KampusKart.

## Email System Overview

The password reset system works as follows:

1. User requests a password reset by providing their email address
2. The system generates a 6-digit OTP code
3. The OTP code is sent to the user's email address
4. User enters the OTP code and their new password
5. If the OTP is valid, the password is reset

## Environment Configuration

You need to configure the following environment variables in your `.env` file:

```
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Explanation of Variables

- `EMAIL_SERVICE`: The email service provider (default is 'Gmail')
- `EMAIL_USERNAME`: Your email address used to send emails
- `EMAIL_PASSWORD`: For Gmail, this should be an "App Password", not your regular account password

## Setting Up Gmail for Sending Emails

### Step 1: Enable 2-Factor Authentication

You need to enable 2-Factor Authentication (2FA) for your Google account:

1. Go to your Google Account
2. Select "Security"
3. Under "Signing in to Google," select "2-Step Verification"
4. Follow the on-screen steps to enable 2FA

### Step 2: Create an App Password

Once 2FA is enabled, you need to create an App Password:

1. Go to your Google Account
2. Select "Security"
3. Under "Signing in to Google," select "App passwords"
4. Select "Mail" as the app and "Other (Custom name)" as the device
5. Enter "KampusKart" or any name you prefer
6. Google will generate a 16-character password - copy this
7. Paste this app password as the value for `EMAIL_PASSWORD` in your `.env` file

## Testing Email Configuration

To test if your email configuration is working:

1. Run the email configuration test utility:
   ```
   node utils/emailCheck.js your-test-email@example.com
   ```

2. Check if you receive the test email at the specified address
3. If successful, the console will display a success message

## Troubleshooting

### Common Issues:

1. **Authentication Error (EAUTH):**
   - Verify your email username and password are correct
   - For Gmail, make sure you're using an App Password, not your regular password
   - Check if your Google account has 2FA enabled (required for App Passwords)

2. **Socket Error (ESOCKET):**
   - Check your network connection
   - Verify that outgoing port 587 (or 465) is not blocked by a firewall

3. **Envelope Error (EENVELOPE):**
   - Verify that your email addresses (from and to) are valid
   - Check for typos in email addresses

### Gmail-Specific Issues:

1. **Less Secure Apps:**
   - Gmail no longer supports "Less Secure Apps" access
   - You must use App Passwords with 2FA enabled instead

2. **Gmail Send Limits:**
   - Gmail has a sending limit of 500 emails per day for regular accounts
   - Consider using a service like SendGrid for production environments

## Production Recommendations

For production environments, consider:

1. Using a dedicated email service like SendGrid, Mailgun, or Amazon SES
2. Setting up proper SPF and DKIM records to improve email deliverability
3. Using a custom domain for your sending email address to build trust

## Additional Help

If you're still experiencing issues, please check:

1. Gmail SMTP settings: `smtp.gmail.com`, port 587 (TLS) or 465 (SSL)
2. Your Google account activity for any security alerts
3. Gmail's "Recent account activity" for any blocked sign-in attempts

For more detailed information, refer to the [Nodemailer documentation](https://nodemailer.com/about/). 