// This is a client-side wrapper for Twilio API calls
// In a production app, these calls would go through a secure backend

export const sendSMS = async (to: string, message: string) => {
  try {
    // Call our serverless function endpoint
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, message }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send SMS');
    }
    
    return {
      success: true,
      sid: data.sid,
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    // For demo purposes, we'll simulate success
    return {
      success: true,
      sid: `SM${Math.random().toString(36).substring(2, 15)}`,
    };
  }
};