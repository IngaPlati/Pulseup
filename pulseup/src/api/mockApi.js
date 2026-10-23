const ACCOUNTS_KEY = 'pulseupLocalAccounts';
const DATA_KEY = 'pulseupLocalData';

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
function readAccounts() { return readJson(ACCOUNTS_KEY, []); }
function readData() {
  return readJson(DATA_KEY, {
    appointments: [],
    slots: [],
    quests: [],
    staff: [],
    students: [],
    admins: [],
  });
}
function writeData(data) { writeJson(DATA_KEY, data); }
function respond(config, status, data) {
  const response = { data, status, statusText: status >= 200 && status < 300 ? 'OK' : 'Error', headers: {}, config };
  return status >= 200 && status < 300 ? Promise.resolve(response) : Promise.reject({ isAxiosError: true, message: data?.message || 'Request failed', config, response });
}
function toSession(account) {
  const { password, ...user } = account;
  return { ...user, token: `local-token-${account.userId}` };
}
function register(config, body, role) {
  const email = String(body.email || '').trim().toLowerCase();
  if (!email) return respond(config, 400, { message: 'Enter an email address.' });
  if (readAccounts().some((account) => account.email === email)) return respond(config, 409, { message: 'An account with this email address already exists.' });
  const account = { ...body, email, role, userId: Date.now() };
  writeJson(ACCOUNTS_KEY, [...readAccounts(), account]);
  const data = readData();
  const key = role === 'STUDENT' ? 'students' : role === 'STAFF' ? 'staff' : 'admins';
  data[key] = [...(data[key] || []), toSession(account)];
  writeData(data);
  return respond(config, 201, toSession(account));
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('pulseupUser') || 'null') || {}; }
  catch { return {}; }
}
export default function mockAdapter(config) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
  const data = readData();
  const user = getCurrentUser();

  if (url.includes('/auth/login') && method === 'post') {
    const email = String(body.email || '').trim().toLowerCase();
    let account = readAccounts().find((item) => item.email === email && item.password === body.password);
    return account ? respond(config, 200, toSession(account)) : respond(config, 401, { message: 'Incorrect email or password. Please try again or create an account.' });
  }
  if (url.includes('/auth/register/student')) return register(config, body, 'STUDENT');
  if (url.includes('/auth/register/staff')) return register(config, body, 'STAFF');
  if (url.includes('/auth/register/admin')) return register(config, body, 'ADMIN');
  if (url.includes('/auth/resend-verification')) return respond(config, 200, { message: 'Verification email request received.' });

  if (url.includes('/students/me') && method === 'get') return respond(config, 200, user);
  if (url.includes('/students/me/profile') && method === 'put') {
    const updated = { ...user, ...body };
    try { localStorage.setItem('pulseupUser', JSON.stringify(updated)); } catch {}
    return respond(config, 200, updated);
  }
  if (url.includes('/staff/me')) return respond(config, 200, user);

  if (url.includes('/time-slots') && method === 'get') {
    const type = config.params?.appointmentType;
    return respond(config, 200, type ? data.slots.filter((slot) => !type || slot.appointmentType === type) : data.slots);
  }
  if (url.includes('/time-slots') && method === 'post') {
    const slot = { ...body, slotId: Date.now(), available: true };
    data.slots.push(slot); writeData(data); return respond(config, 201, slot);
  }
  if (url.includes('/appointments') && method === 'get') {
    if (url.includes('/my-queue')) return respond(config, 200, data.appointments.filter((item) => item.studentEmail === user.email || item.studentId === user.userId));
    return respond(config, 200, data.appointments);
  }
  if (url.includes('/appointments') && method === 'post') {
    const appointment = { ...body, appointmentId: Date.now(), studentEmail: user.email, studentId: user.userId, status: 'PENDING', createdAt: new Date().toISOString() };
    data.appointments.push(appointment); writeData(data); return respond(config, 201, appointment);
  }
  if (url.includes('/health-quests') && method === 'get') return respond(config, 200, data.quests);
  if (url.includes('/health-quests') && method === 'post') {
    const quest = { ...body, questId: Date.now() }; data.quests.push(quest); writeData(data); return respond(config, 201, quest);
  }
  if (url.includes('/vouchers/me/progress')) return respond(config, 200, { points: 0, completedQuests: 0, totalQuests: data.quests.length, vouchersEarned: 0 });
  if (url.includes('/vouchers/me')) return respond(config, 200, []);
  if (url.includes('/students')) return respond(config, 200, data.students);
  if (url.includes('/staff')) return respond(config, 200, data.staff);
  if (url.includes('/admins')) return respond(config, 200, data.admins);
  return respond(config, 200, []);
}
