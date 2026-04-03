import { Link } from 'react-router-dom';

export default function DataDeletion() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main, #f8fafc)', fontFamily: 'Inter, Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'var(--bg-card, #ffffff)', borderBottom: '1px solid var(--border, #e2e8f0)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary, #6c63ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>S</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary, #1a1a2e)' }}>Samarth CRM</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted, #94a3b8)' }}>SaaS Platform</div>
          </div>
        </div>
        <Link to="/login" style={{ fontSize: 13, color: 'var(--primary, #6c63ff)', textDecoration: 'none', fontWeight: 500 }}>← Back to Login</Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

        <h1 style={{ color: '#1a1a2e', borderBottom: '3px solid #e63946', paddingBottom: 12, marginBottom: 8, fontSize: 32, fontWeight: 800 }}>Data Deletion Request</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Last updated: April 3, 2026</p>

        <p style={p}>At <strong>Under Construction Homes for 2BHK, 3BHK and 4 BHK</strong>, we respect your right to have your personal data deleted from our systems. This page explains how you can submit a data deletion request.</p>

        {/* Info Box */}
        <div style={infoBox}>
          <strong>What data do we hold?</strong><br />
          We may hold your name, phone number, WhatsApp message history, email address, and real estate inquiry details that you have shared with us directly or through WhatsApp Business communications.
        </div>

        <h2 style={h2}>How to Request Data Deletion</h2>

        {/* Steps Box */}
        <div style={stepsBox}>
          <strong>Follow these steps to request deletion of your data:</strong>
          <ol style={{ margin: '12px 0 0', paddingLeft: 22 }}>
            <li style={li}>Send an email to <a href="mailto:tilwagh@gmail.com" style={a}>tilwagh@gmail.com</a></li>
            <li style={li}>Use the subject line: <strong>"Data Deletion Request"</strong></li>
            <li style={li}>Include the following in your email:
              <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                <li style={li}>Your full name</li>
                <li style={li}>Your phone number (WhatsApp number used)</li>
                <li style={li}>Your email address (if provided to us)</li>
                <li style={li}>A brief description of what data you want deleted</li>
              </ul>
            </li>
            <li style={li}>We will confirm receipt of your request within <strong>7 business days</strong></li>
            <li style={li}>Your data will be permanently deleted within <strong>30 days</strong> of your request</li>
          </ol>
        </div>

        <h2 style={h2}>What Happens After Your Request</h2>
        <p style={p}>Once we receive your data deletion request, we will:</p>
        <ul style={ul}>
          <li style={li}>Verify your identity to ensure we are deleting the correct data.</li>
          <li style={li}>Remove your personal data from our CRM platform (Samarth CRM).</li>
          <li style={li}>Delete your WhatsApp contact and message history from our system.</li>
          <li style={li}>Send you a confirmation email once deletion is complete.</li>
        </ul>

        <h2 style={h2}>Exceptions</h2>
        <p style={p}>Please note that we may be required to retain certain data in the following cases:</p>
        <ul style={ul}>
          <li style={li}>To comply with applicable legal obligations.</li>
          <li style={li}>To resolve disputes or enforce our agreements.</li>
          <li style={li}>For legitimate business purposes permitted by law.</li>
        </ul>
        <p style={p}>In such cases, we will inform you of the specific data we are required to retain and the reason.</p>

        <h2 style={h2}>Facebook / Meta Data</h2>
        <p style={p}>If you connected to our services via Facebook or Meta, you can also manage your data through Meta's platform. To remove our app's access to your Facebook or WhatsApp data:</p>
        <ul style={ul}>
          <li style={li}>Go to your <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noreferrer" style={a}>Facebook App Settings</a></li>
          <li style={li}>Find <strong>n8n-AI-Agent</strong> in the list of connected apps</li>
          <li style={li}>Click <strong>Remove</strong> to revoke access</li>
        </ul>
        <p style={p}>This will prevent our app from accessing your Meta data going forward. To delete previously collected data, please follow the email request process above.</p>

        <h2 style={h2}>Contact Us</h2>
        <p style={p}>For any questions regarding data deletion or your privacy rights, please contact us:</p>
        <ul style={ul}>
          <li style={li}><strong>Business Name:</strong> Under Construction Homes for 2BHK, 3BHK and 4 BHK</li>
          <li style={li}><strong>Proprietor:</strong> Abhijit Ramdas Take</li>
          <li style={li}><strong>Address:</strong> Ward No. 07, Shrirampur, Ahmednagar, Maharashtra – 413709, India</li>
          <li style={li}><strong>Email:</strong> <a href="mailto:tilwagh@gmail.com" style={a}>tilwagh@gmail.com</a></li>
        </ul>

        <p style={p}>
          For more information about how we handle your data, please read our{' '}
          <Link to="/privacy-policy" style={a}>Privacy Policy</Link> and{' '}
          <Link to="/terms" style={a}>Terms of Service</Link>.
        </p>

        <footer style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid var(--border, #e2e8f0)', fontSize: 13, color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span>&copy; 2026 Under Construction Homes for 2BHK, 3BHK and 4 BHK. All rights reserved.</span>
          <span>
            <Link to="/terms" style={{ color: '#e63946', textDecoration: 'none', marginRight: 16 }}>Terms of Service</Link>
            <Link to="/privacy-policy" style={{ color: '#e63946', textDecoration: 'none', marginRight: 16 }}>Privacy Policy</Link>
            <Link to="/data-deletion" style={{ color: '#e63946', textDecoration: 'none' }}>Data Deletion</Link>
          </span>
        </footer>
      </div>
    </div>
  );
}

// Shared inline styles
const h2 = { color: '#1a1a2e', marginTop: 36, marginBottom: 8, fontSize: 18, fontWeight: 700 };
const p = { fontSize: 15, lineHeight: 1.8, color: '#444', marginBottom: 12 };
const ul = { paddingLeft: 22, marginBottom: 12 };
const li = { fontSize: 15, lineHeight: 1.8, color: '#444', marginBottom: 4 };
const a = { color: '#e63946', textDecoration: 'none' };
const infoBox = {
  background: '#f0f4ff',
  borderLeft: '4px solid #1a1a2e',
  padding: '16px 20px',
  borderRadius: 4,
  margin: '24px 0',
  fontSize: 15,
  lineHeight: 1.8,
  color: '#333',
};
const stepsBox = {
  background: '#fff8f0',
  borderLeft: '4px solid #e63946',
  padding: '16px 20px',
  borderRadius: 4,
  margin: '24px 0',
  fontSize: 15,
  lineHeight: 1.8,
  color: '#333',
};
