/**
 * Email Configuration Test Utility
 * 
 * This utility checks the email configuration and sends a test email.
 * Run with: node utils/emailCheck.js <test-email-address>
 */

const nodemailer = require('nodemailer');

// Check if email credentials are present
function checkEmailCredentials() {
  console.log('Checking email configuration...');
  
  if (!process.env.EMAIL_SERVICE) {
    console.error('❌ EMAIL_SERVICE is not configured in .env file');
    return false;
  }
  
  if (!process.env.EMAIL_USERNAME) {
    console.error('❌ EMAIL_USERNAME is not configured in .env file');
    return false;
  }
  
  if (!process.env.EMAIL_PASSWORD) {
    console.error('❌ EMAIL_PASSWORD is not configured in .env file');
    return false;
  }
  
  console.log('✅ Email configuration found in environment variables:');
  console.log(`   Service: ${process.env.EMAIL_SERVICE}`);
  console.log(`   Username: ${process.env.EMAIL_USERNAME}`);
  console.log(`   Password: [REDACTED]`);
  
  return true;
}

// Create a transporter
function createTransporter() {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true
    });
    
    console.log('✅ Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
}

// Verify transporter connection
async function verifyTransporter(transporter) {
  try {
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    console.error('  Details:', error);
    return false;
  }
}

// Send a test email
async function sendTestEmail(transporter, testEmail) {
  try {
    console.log(`Sending test email to: ${testEmail}`);
    
    const result = await transporter.sendMail({
      from: `"Email Test" <${process.env.EMAIL_USERNAME}>`,
      to: testEmail,
      subject: 'KampusKart Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <div style="background-color: #4CAF50; padding: 15px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">KampusKart Email Test</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello,</p>
            <p>This is a test email to verify that your email configuration is working correctly.</p>
            <p>If you received this email, your email configuration is working!</p>
            <p>Test completed at: ${new Date().toISOString()}</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>© ${new Date().getFullYear()} KampusKart. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `KampusKart Email Test: This is a test email to verify that your email configuration is working correctly. Test completed at: ${new Date().toISOString()}`
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('   Authentication error - check your email credentials');
    } else if (error.code === 'ESOCKET') {
      console.error('   Socket error - check your network connection');
    } else if (error.code === 'EENVELOPE') {
      console.error('   Envelope error - check email addresses');
    }
    
    console.error('   Full error details:', error);
    return false;
  }
}

// Main function
async function main() {
  // Get email address from command line
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.error('❌ Please provide a test email address as an argument');
    console.error('   Usage: node utils/emailCheck.js test@example.com');
    process.exit(1);
  }
  
  // Load environment variables
  require('dotenv').config();
  
  console.log('===========================================');
  console.log('   EMAIL CONFIGURATION TEST');
  console.log('===========================================');
  
  // Check credentials
  if (!checkEmailCredentials()) {
    console.error('❌ Email configuration is incomplete. Please check your .env file.');
    process.exit(1);
  }
  
  // Create transporter
  const transporter = createTransporter();
  if (!transporter) {
    console.error('❌ Failed to create email transporter.');
    process.exit(1);
  }
  
  // Verify transporter
  const isVerified = await verifyTransporter(transporter);
  if (!isVerified) {
    console.error('❌ Failed to verify email transporter.');
    process.exit(1);
  }
  
  // Send test email
  const isEmailSent = await sendTestEmail(transporter, testEmail);
  if (!isEmailSent) {
    console.error('❌ Failed to send test email.');
    process.exit(1);
  }
  
  console.log('===========================================');
  console.log('✅ Email configuration test completed successfully!');
  console.log('   Your email system is working correctly.');
  console.log('===========================================');
}

// Run the main function
main().catch(error => {
  console.error('❌ An unexpected error occurred:', error);
  process.exit(1);
}); 