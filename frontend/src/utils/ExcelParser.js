/**
 * Minimal Excel/CSV Parser for Campaign Wizard
 * In a real app, use the 'xlsx' library.
 */

export const parseLeadFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        // Simple CSV parsing for demo
        const lines = text.split(/\r?\n/);
        const leads = [];
        
        // Skip header if it exists
        const startIdx = lines[0].toLowerCase().includes('phone') || lines[0].toLowerCase().includes('mobile') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',');
          // Assume format: Mobile, Name (optional)
          const mobile = parts[0]?.replace(/[^0-9]/g, '');
          if (mobile && mobile.length >= 10) {
            leads.push({
              mobile: mobile,
              name: parts[1]?.trim() || `Lead ${mobile.slice(-4)}`
            });
          }
        }
        resolve(leads);
      } catch (err) {
        reject(new Error('Failed to parse file. Please use a valid CSV format.'));
      }
    };

    reader.onerror = () => reject(new Error('File reading failed.'));
    reader.readAsText(file);
  });
};
