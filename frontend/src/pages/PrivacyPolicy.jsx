import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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

        <h1 style={{ color: '#1a1a2e', borderBottom: '3px solid #e63946', paddingBottom: 12, marginBottom: 8, fontSize: 32, fontWeight: 800 }}>Privacy Policy</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Last updated: April 3, 2026</p>

        <p style={p}>This Privacy Policy describes how <strong>Under Construction Homes for 2BHK, 3BHK and 4 BHK</strong> ("we", "us", or "our"), operated by <strong>Abhijit Ramdas Take</strong>, collects, uses, and protects information when you use our services, including our CRM platform available at <a href="https://samarth-crm-dashboard.tilottamwagh.com" style={a}>samarth-crm-dashboard.tilottamwagh.com</a>.</p>

        <h2 style={h2}>1. Information We Collect</h2>
        <p style={p}>We may collect the following types of information:</p>
        <ul style={ul}>
          <li style={li}><strong>Contact information:</strong> Name, phone number, email address provided by users or leads.</li>
          <li style={li}><strong>WhatsApp data:</strong> Messages, phone numbers, and WhatsApp Business Account information accessed through the Meta WhatsApp Business API.</li>
          <li style={li}><strong>Usage data:</strong> Log data, IP addresses, browser type, and pages visited on our platform.</li>
          <li style={li}><strong>Business data:</strong> Information related to real estate inquiries, property interests, and appointment details.</li>
        </ul>

        <h2 style={h2}>2. How We Use Your Information</h2>
        <p style={p}>We use the information we collect to:</p>
        <ul style={ul}>
          <li style={li}>Manage customer relationships and respond to inquiries.</li>
          <li style={li}>Send WhatsApp messages and marketing communications related to our real estate services.</li>
          <li style={li}>Book appointments and follow up with prospective customers.</li>
          <li style={li}>Improve our platform and services.</li>
          <li style={li}>Comply with legal obligations.</li>
        </ul>

        <h2 style={h2}>3. Meta Platform Data</h2>
        <p style={p}>Our platform integrates with Meta's WhatsApp Business API. We access and process WhatsApp Business Account data, including phone number IDs and business account identifiers, solely for the purpose of managing business communications. We do not sell or share this data with unauthorized third parties.</p>
        <p style={p}>We use the following Meta permissions:</p>
        <ul style={ul}>
          <li style={li}><strong>whatsapp_business_management:</strong> To manage our WhatsApp Business Account.</li>
          <li style={li}><strong>whatsapp_business_messaging:</strong> To send and receive WhatsApp messages.</li>
        </ul>

        <h2 style={h2}>4. Data Sharing and Third Parties</h2>
        <p style={p}>We may share your data with the following service providers who help us operate our platform:</p>
        <ul style={ul}>
          <li style={li}><strong>Samarth CRM</strong> – CRM platform for managing customer communications.</li>
          <li style={li}><strong>Meta Platforms, Inc.</strong> – WhatsApp Business API provider.</li>
        </ul>
        <p style={p}>We do not sell your personal data to any third party.</p>

        <h2 style={h2}>5. Data Retention</h2>
        <p style={p}>We retain personal data for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your data at any time by contacting us.</p>

        <h2 style={h2}>6. Data Security</h2>
        <p style={p}>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Our platform is hosted on secure HTTPS infrastructure.</p>

        <h2 style={h2}>7. Your Rights</h2>
        <p style={p}>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul style={ul}>
          <li style={li}>Right to access your personal data.</li>
          <li style={li}>Right to correct inaccurate data.</li>
          <li style={li}>Right to request deletion of your data.</li>
          <li style={li}>Right to object to processing of your data.</li>
          <li style={li}>Right to data portability.</li>
        </ul>
        <p style={p}>To exercise any of these rights, please contact us at <a href="mailto:tilwagh@gmail.com" style={a}>tilwagh@gmail.com</a>.</p>

        <h2 style={h2}>8. Data Deletion</h2>
        <p style={p}>To request deletion of your personal data from our systems, please send an email to <a href="mailto:tilwagh@gmail.com" style={a}>tilwagh@gmail.com</a> with the subject line "Data Deletion Request". We will process your request within 30 days.</p>

        <h2 style={h2}>9. Cookies</h2>
        <p style={p}>Our platform may use cookies and similar tracking technologies to enhance your experience. You can control cookies through your browser settings.</p>

        <h2 style={h2}>10. Changes to This Policy</h2>
        <p style={p}>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated date.</p>

        <h2 style={h2}>11. Contact Us</h2>
        <p style={p}>If you have any questions about this Privacy Policy, please contact us:</p>
        <ul style={ul}>
          <li style={li}><strong>Business Name:</strong> Under Construction Homes for 2BHK, 3BHK and 4 BHK</li>
          <li style={li}><strong>Proprietor:</strong> Abhijit Ramdas Take</li>
          <li style={li}><strong>Address:</strong> Ward No. 07, Shrirampur, Ahmednagar, Maharashtra – 413709, India</li>
          <li style={li}><strong>Email:</strong> <a href="mailto:tilwagh@gmail.com" style={a}>tilwagh@gmail.com</a></li>
        </ul>

        <footer style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid var(--border, #e2e8f0)', fontSize: 13, color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span>&copy; 2026 Under Construction Homes for 2BHK, 3BHK and 4 BHK. All rights reserved.</span>
          <span>
            <Link to="/terms" style={{ color: '#e63946', textDecoration: 'none', marginRight: 16 }}>Terms of Service</Link>
            <Link to="/privacy-policy" style={{ color: '#e63946', textDecoration: 'none' }}>Privacy Policy</Link>
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
