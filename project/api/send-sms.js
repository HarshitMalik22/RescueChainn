// This would be a serverless function in a real deployment
// For demo purposes, we'll simulate the Twilio API response

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  // In a real implementation, this would use the Twilio SDK
  console.log(`Sending SMS to ${to}: ${message}`);
  
  // Simulate API call
  setTimeout(() => {
    // Return a successful response
    res.status(200).json({
      success: true,
      sid: `SM${Math.random().toString(36).substring(2, 15)}`,
      to,
      message,
    });
  }, 500);
}