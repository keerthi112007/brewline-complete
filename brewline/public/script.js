// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
  })
);

// Monthly / yearly pricing toggle
document.querySelectorAll('.toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    const period = btn.dataset.period;
    document.querySelectorAll('.toggle button').forEach(b => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
    document.querySelectorAll('.price span').forEach(el => {
      el.textContent = el.dataset[period];
    });
    document.querySelectorAll('.price small').forEach(el => {
      el.textContent = period === 'monthly' ? '/month' : '/month, billed yearly';
    });
  });
});

// Choosing a plan pre-selects it in the form
document.querySelectorAll('[data-plan]').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('planSelect').value = link.dataset.plan;
  });
});

// Lead form validation
const form = document.getElementById('leadForm');
const status = document.getElementById('formStatus');

function setError(field, message) {
  const label = field.closest('label');
  label.classList.toggle('invalid', Boolean(message));
  label.querySelector('.error').textContent = message;
}

function validate() {
  let ok = true;
  const { name, email, plan } = form.elements;

  if (name.value.trim().length < 2) { setError(name, 'Enter your full name.'); ok = false; }
  else setError(name, '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, 'Enter a valid email, like name@example.com.'); ok = false; }
  else setError(email, '');

  if (!plan.value) { setError(plan, 'Select a plan.'); ok = false; }
  else setError(plan, '');

  return ok;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  status.textContent = '';
  status.style.color = '';
  if (!validate()) return;

  const btn = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form));
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await res.json();
    if (!res.ok) {
      // Show server-side field errors next to the fields
      Object.entries(body.errors || {}).forEach(([key, msg]) => form.elements[key] && setError(form.elements[key], msg));
      throw new Error(body.message || 'Something went wrong.');
    }
    status.textContent = `Thanks, ${data.name.split(' ')[0]}! We'll email your ${data.plan} plan details within one business day.`;
    form.reset();
  } catch (err) {
    status.style.color = '#c0392b';
    status.textContent = err.message + ' Please try again.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send my details';
  }
});

// Dark / light theme
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
function applyTheme(t) {
  root.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? 'Light' : 'Dark';
  themeBtn.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} mode`);
}
applyTheme(root.dataset.theme || 'light');
themeBtn.addEventListener('click', () => {
  const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(t);
  try { localStorage.setItem('theme', t); } catch (e) {}
});

// Coffee finder quiz
const COFFEES = {
  fruity: { name: 'Araku Valley', notes: 'orange peel, brown sugar and a floral finish (grown in Andhra Pradesh)' },
  choc:   { name: 'Monsoon Malabar', notes: 'dark chocolate, spice and a heavy, low-acid body (from Kerala)' },
  nutty:  { name: 'Coorg Estate', notes: 'roasted almond, caramel and cardamom-like sweetness (from Karnataka)' }
};
const GRIND = { 'Espresso': 'a fine grind', 'South Indian filter': 'a medium-fine grind for your decoction filter', 'Filter / pour-over': 'a medium grind', 'French press': 'a coarse grind' };
const quizResult = document.getElementById('quizResult');

function showMatch() {
  const brew = document.querySelector('input[name="brew"]:checked');
  const taste = document.querySelector('input[name="taste"]:checked');
  if (!brew || !taste) return;
  const c = COFFEES[taste.value];
  quizResult.innerHTML = '';
  const h = document.createElement('h3'); h.textContent = `${c.name} is your match`;
  const p = document.createElement('p'); p.textContent = `Expect ${c.notes}. We'll send it as ${GRIND[brew.value]} for ${brew.value.toLowerCase()}.`;
  const a = document.createElement('a'); a.href = '#contact'; a.className = 'btn'; a.textContent = 'Start with this coffee';
  a.addEventListener('click', () => {
    form.elements.coffee.value = c.name;
    form.elements.method.value = brew.value;
  });
  quizResult.append(h, p, a);
}
document.querySelectorAll('input[name="brew"], input[name="taste"]').forEach(i => i.addEventListener('change', showMatch));

// Newsletter signup
const subForm = document.getElementById('subForm');
const subStatus = document.getElementById('subStatus');
subForm.addEventListener('submit', async e => {
  e.preventDefault();
  subStatus.style.color = '';
  const email = subForm.elements.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    subStatus.style.color = '#c0392b';
    subStatus.textContent = 'Enter a valid email, like name@example.com.';
    return;
  }
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, website: subForm.elements.website.value })
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message);
    subStatus.textContent = body.message;
    subForm.reset();
  } catch (err) {
    subStatus.style.color = '#c0392b';
    subStatus.textContent = (err.message || 'Something went wrong.') + ' Please try again.';
  }
});
