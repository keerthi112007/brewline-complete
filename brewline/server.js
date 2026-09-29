require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-me';
const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const PLANS = ['Solo', 'Duo', 'Office'];
const METHODS = ['Espresso', 'South Indian filter', 'Filter / pour-over', 'French press', 'Not sure yet'];

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, '[]');

const SUBS_FILE = path.join(DATA_DIR, 'subscribers.json');
if (!fs.existsSync(SUBS_FILE)) fs.writeFileSync(SUBS_FILE, '[]');
const readSubs = () => JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
const writeSubs = subs => fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
const readLeads = () => JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
const writeLeads = leads => fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

const app = express();
app.use(express.json({ limit: '10kb' }));

// Basic security headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  next();
});

// Simple in-memory rate limit: 5 submissions per IP per 10 minutes
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (recent.length >= 5) return res.status(429).json({ message: 'Too many requests.' });
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

function validateLead(b) {
  const errors = {};
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  if (name.length < 2 || name.length > 80) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) errors.email = 'Enter a valid email, like name@example.com.';
  if (!PLANS.includes(b.plan)) errors.plan = 'Select a plan.';
  const method = METHODS.includes(b.method) ? b.method : 'Not sure yet';
  const coffee = String(b.coffee || '').slice(0, 60);
  return { errors, clean: { name, email, plan: b.plan, method, coffee } };
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/leads', rateLimit, (req, res) => {
  // Honeypot: bots fill the hidden field; pretend success and drop it
  if (req.body.website) return res.status(201).json({ message: 'Received.' });

  const { errors, clean } = validateLead(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });

  const leads = readLeads();
  if (leads.some(l => l.email === clean.email && l.plan === clean.plan)) {
    return res.status(409).json({ message: `We already have a ${clean.plan} request from this email.` });
  }
  const lead = { id: crypto.randomUUID(), ...clean, createdAt: new Date().toISOString() };
  leads.push(lead);
  writeLeads(leads);
  res.status(201).json({ message: 'Received.', id: lead.id });
});

const adminOnly = (req, res, next) =>
  req.get('x-admin-token') === ADMIN_TOKEN ? next() : res.status(401).json({ message: 'Unauthorized.' });

// Newsletter signup
app.post('/api/subscribe', rateLimit, (req, res) => {
  if (req.body.website) return res.status(201).json({ message: 'Subscribed.' });
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return res.status(400).json({ message: 'Enter a valid email, like name@example.com.' });
  }
  const subs = readSubs();
  if (subs.some(x => x.email === email)) return res.status(200).json({ message: "You're already subscribed." });
  subs.push({ email, createdAt: new Date().toISOString() });
  writeSubs(subs);
  res.status(201).json({ message: "You're in. Watch for our next roast drop." });
});

// Admin: list leads (JSON, or CSV with ?format=csv)
// Example: curl -H "x-admin-token: change-me" http://localhost:3000/api/leads
const csvCell = v => {
  let t = String(v ?? '');
  if (/^[=+\-@]/.test(t)) t = "'" + t; // block spreadsheet formula injection
  return '"' + t.replace(/"/g, '""') + '"';
};
app.get('/api/leads', adminOnly, (req, res) => {
  const leads = readLeads();
  if (req.query.format === 'csv') {
    const cols = ['id', 'name', 'email', 'plan', 'method', 'coffee', 'createdAt'];
    const rows = [cols.join(','), ...leads.map(l => cols.map(c => csvCell(l[c])).join(','))];
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="brewline-leads.csv"' });
    return res.send(rows.join('\n'));
  }
  res.json(leads);
});

app.delete('/api/leads/:id', adminOnly, (req, res) => {
  const leads = readLeads();
  const next = leads.filter(l => l.id !== req.params.id);
  if (next.length === leads.length) return res.status(404).json({ message: 'Lead not found.' });
  writeLeads(next);
  res.json({ message: 'Deleted.' });
});

app.get('/api/subscribers', adminOnly, (req, res) => res.json(readSubs()));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', (req, res) => res.status(404).json({ message: 'Not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: 'Server error.' });
});

app.listen(PORT, () => console.log(`Brewline running at http://localhost:${PORT}`));
