import { Link } from 'react-router-dom';

export default function TermsOfService() {
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

        <h1 style={{ color: '#1a1a2e', borderBottom: '3px solid #e63946', paddingBottom: 12, marginBottom: 8, fontSize: 32, fontWeight: 800 }}>Terms of Service</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Last updated: April 3, 2026</p>

        <p style={p}>These Terms of Service ("Terms") govern your use of the services provided by <strong>Under Construction Homes for 2BHK, 3BHK and 4 BHK</strong> ("we", "us", or "our"), operated by <strong>Abhijit Ramdas Take</strong>, including our CRM platform at <a href="https://samarth-crm-dashboard.tilottamwagh.com" style={a}>samarth-crm-dashboard.tilottamwagh.com</a> and any related WhatsApp Business communications.</p>
        <p style={p}>By accessing or using our services, you agree to be bound by these Terms. If you do not agree, please do not use our services.</p>

        <h2 style={h2}>1. Description of Services</h2>
        <p style={p}>We provide a CRM-based platform to manage real estate customer relationships, WhatsApp marketing campaigns, and appointment booking for properties including 2BHK, 3BHK, and 4 BHK homes currently under construction. Our services include:</p>
        <ul style={ul}>
          <li style={li}>WhatsApp Business messaging and campaigns.</li>
          <li style={li}>Customer relationship management (CRM) tools.</li>
          <li style={li}>Appointment scheduling and follow-up communications.</li>
          <li style={li}>Lead management and reporting.</li>
        </ul>

        <h2 style={h2}>2. User Accounts</h2>
        <p style={p}>To access certain features of our platform, you must create an account. You are responsible for:</p>
        <ul style={ul}>
          <li style={li}>Maintaining the confidentiality of your login credentials.</li>
          <li style={li}>All activities that occur under your account.</li>
          <li style={li}>Notifying us immediately of any unauthorized use of your account.</li>
        </ul>
        <p style={p}>We reserve the right to suspend or terminate accounts that violate these Terms.</p>

        <h2 style={h2}>3. Acceptable Use</h2>
        <p style={p}>You agree to use our services only for lawful purposes. You must not:</p>
        <ul style={ul}>
          <li style={li}>Send spam, unsolicited messages, or misleading communications via WhatsApp.</li>
          <li style={li}>Use our platform to harass, threaten, or harm any person.</li>
          <li style={li}>Violate any applicable laws, regulations, or Meta's WhatsApp Business Policy.</li>
          <li style={li}>Attempt to gain unauthorized access to our systems or other users' accounts.</li>
          <li style={li}>Use the platform to transmit malicious code, viruses, or harmful content.</li>
        </ul>

        <h2 style={h2}>4. WhatsApp Business Communications</h2>
        <p style={p}>Our platform uses the Meta WhatsApp Business API to send messages to customers. By using our services, you acknowledge that:</p>
        <ul style={ul}>
          <li style={li}>All WhatsApp communications must comply with <a href="https://www.whatsapp.com/legal/business-policy" target="_blank" rel="noreferrer" style={a}>Meta's WhatsApp Business Policy</a>.</li>
          <li style={li}>You must obtain proper consent from recipients before sending marketing messages.</li>
          <li style={li}>We are not responsible for any violations of Meta's policies resulting from your use of the platform.</li>
        </ul>

        <h2 style={h2}>5. Intellectual Property</h2>
        <p style={p}>All content, trademarks, logos, and materials on our platform are owned by or licensed to us. You may not copy, reproduce, or distribute any content without our prior written consent.</p>

        <h2 style={h2}>6. Data and Privacy</h2>
        <p style={p}>Your use of our services is also governed by our <Link to="/privacy-policy" style={a}>Privacy Policy</Link>, which is incorporated into these Terms by reference. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.</p>

        <h2 style={h2}>7. Disclaimer of Warranties</h2>
        <p style={p}>Our services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that:</p>
        <ul style={ul}>
          <li style={li}>The platform will be uninterrupted, error-free, or secure.</li>
          <li style={li}>Any information provided is accurate, complete, or reliable.</li>
          <li style={li}>Defects will be corrected.</li>
        </ul>

        <h2 style={h2}>8. Limitation of Liability</h2>
        <p style={p}>To the fullest extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services, including but not limited to loss of data, loss of revenue, or business interruption.</p>

        <h2 style={h2}>9. Indemnification</h2>
        <p style={p}>You agree to indemnify and hold harmless <strong>Abhijit Ramdas Take</strong> and Under Construction Homes from any claims, damages, losses, or expenses (including legal fees) arising from your use of our services or violation of these Terms.</p>

        <h2 style={h2}>10. Termination</h2>
        <p style={p}>We reserve the right to suspend or terminate your access to our services at any time, with or without notice, for any reason including violation of these Terms. Upon termination, your right to use our services will immediately cease.</p>

        <h2 style={h2}>11. Governing Law</h2>
        <p style={p}>These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Ahmednagar, Maharashtra, India</strong>.</p>

        <h2 style={h2}>12. Changes to Terms</h2>
        <p style={p}>We reserve the right to modify these Terms at any time. We will notify users of significant changes by updating the date at the top of this page. Your continued use of our services after any changes constitutes your acceptance of the new Terms.</p>

        <h2 style={h2}>13. Contact Us</h2>
        <p style={p}>If you have any questions about these Terms of Service, please contact us:</p>
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
