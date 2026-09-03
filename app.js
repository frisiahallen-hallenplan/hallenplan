const halls = ['Friesenhalle', 'Kleine Halle Risum', 'Sporthalle Dänische Schule', 'Kleine Halle Lindholm'];
const hallClasses = {
  'Friesenhalle': 'hall-friesen',
  'Kleine Halle Risum': 'hall-risum',
  'Sporthalle Dänische Schule': 'hall-daenische',
  'Kleine Halle Lindholm': 'hall-lindholm'
};
const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const dayNamesLong = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const storageKey = 'hallenplan-events-v6';
const googleSheetUrl = 'https://script.google.com/macros/s/AKfycbxQoYZ4-mKq6C0xwSAqkMP2qkHSFXcW3qcV5BBSKCSw321cqRYgna72jZEi_vRVmncQ/exec';
const hallFilter = document.querySelector('#hallFilter');
const hallInput = document.querySelector('#hallInput');
const planner = document.querySelector('#planner');
const dialog = document.querySelector('#eventDialog');
const form = document.querySelector('#eventForm');
let currentDate = startOfDay(new Date());
let events = JSON.parse(localStorage.getItem(storageKey) || 'null') || seedEvents();
halls.forEach(hall => { hallFilter.add(new Option(hall, hall)); hallInput.add(new Option(hall, hall)); });

function startOfDay(date) { const result = new Date(date); result.setHours(0, 0, 0, 0); return result; }
function formatDate(date, options = {}) { return new Intl.DateTimeFormat('de-DE', options).format(date); }
function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function weekStart(date) { const result = startOfDay(date); const day = result.getDay(); result.setDate(result.getDate() - (day === 0 ? 6 : day - 1)); return result; }
function seedEvents() { const monday = new Date(2026, 7, 3); const weeklyEvents = [
  makeEvent('Handball - männl. Jugend E', 'Friesenhalle', addDays(monday, 0), '15:30', '17:00', 'training', true, [1], '2026-12-31'),
  makeEvent('Handball - weibl. Jugend D', 'Friesenhalle', addDays(monday, 0), '17:00', '18:30', 'training', true, [1], '2026-12-31'),
  makeEvent('Handball - weibl. Jugend A', 'Friesenhalle', addDays(monday, 0), '18:30', '20:00', 'training', true, [1], '2026-12-31'),
  makeEvent('Handball - weibl. Jugend C 1', 'Friesenhalle', addDays(monday, 1), '17:00', '18:30', 'training', true, [2], '2026-12-31'),
  makeEvent('Handball - Frauen', 'Friesenhalle', addDays(monday, 1), '18:30', '20:00', 'training', true, [2], '2026-12-31'),
  makeEvent('Handball - Männer', 'Friesenhalle', addDays(monday, 1), '20:00', '22:00', 'training', true, [2], '2026-12-31'),
  makeEvent('Ballgewöhnung (bis November)', 'Friesenhalle', addDays(monday, 2), '15:00', '16:30', 'event', true, [3], '2026-11-30'),
  makeEvent('Handball - männl. Jugend D', 'Friesenhalle', addDays(monday, 2), '17:00', '18:30', 'training', true, [3], '2026-12-31'),
  makeEvent('Kinderturnen', 'Friesenhalle', addDays(monday, 3), '14:00', '15:30', 'event', true, [4], '2026-12-31'),
  makeEvent('Eltern & Kind', 'Friesenhalle', addDays(monday, 3), '15:30', '17:00', 'event', true, [4], '2026-12-31'),
  makeEvent('Leistungsturnen Mädchen', 'Friesenhalle', addDays(monday, 3), '17:00', '18:30', 'training', true, [4], '2026-12-31'),
  makeEvent('Handball - weibl. Jugend B', 'Friesenhalle', addDays(monday, 3), '18:30', '20:00', 'training', true, [4], '2026-12-31'),
  makeEvent('Handball - Frauen', 'Friesenhalle', addDays(monday, 3), '20:00', '22:00', 'training', true, [4], '2026-12-31'),
  makeEvent('Handball - weibl. Jugend C 1', 'Friesenhalle', addDays(monday, 4), '17:00', '18:30', 'training', true, [5], '2026-12-31'),
  makeEvent('Handball - Männer', 'Friesenhalle', addDays(monday, 4), '18:30', '20:00', 'training', true, [5], '2026-12-31'),
  makeEvent('Cheerleading/Airtrack - Erwachsene', 'Friesenhalle', addDays(monday, 4), '20:00', '22:00', 'training', true, [5], '2026-12-31'),
  makeEvent('Spiel dich stark (3-5 Jahre)', 'Sporthalle Dänische Schule', addDays(monday, 0), '15:00', '16:00', 'event', true, [1], '2026-12-31'),
  makeEvent('Fitness/Tanzen (7-12 Jahre)', 'Sporthalle Dänische Schule', addDays(monday, 0), '16:00', '17:00', 'training', true, [1], '2026-12-31'),
  makeEvent('Cumba light', 'Sporthalle Dänische Schule', addDays(monday, 0), '17:00', '17:30', 'training', true, [1], '2026-12-31'),
  makeEvent('Bauch-Beine-Po', 'Sporthalle Dänische Schule', addDays(monday, 0), '17:30', '18:30', 'training', true, [1], '2026-12-31'),
  makeEvent('Cumba', 'Sporthalle Dänische Schule', addDays(monday, 0), '18:30', '19:30', 'training', true, [1], '2026-12-31'),
  makeEvent('Step Aerobic Frisia 03', 'Sporthalle Dänische Schule', addDays(monday, 0), '19:30', '21:00', 'training', true, [1], '2026-12-31'),
  makeEvent('Mini Basketball', 'Sporthalle Dänische Schule', addDays(monday, 1), '14:00', '15:00', 'training', true, [2], '2026-12-31'),
  makeEvent('Basketball Kinder', 'Sporthalle Dänische Schule', addDays(monday, 1), '15:00', '16:30', 'training', true, [2], '2026-12-31'),
  makeEvent('Basketball U14', 'Sporthalle Dänische Schule', addDays(monday, 1), '16:30', '18:00', 'training', true, [2], '2026-12-31'),
  makeEvent('Fitness inkl. Bauch/Beine/Po Zumba', 'Sporthalle Dänische Schule', addDays(monday, 1), '18:00', '19:30', 'training', true, [2], '2026-12-31'),
  makeEvent('Yoga', 'Sporthalle Dänische Schule', addDays(monday, 1), '19:30', '21:00', 'training', true, [2], '2026-12-31'),
  makeEvent('Tanzen (1-3 Jahre)', 'Sporthalle Dänische Schule', addDays(monday, 2), '16:00', '16:30', 'event', true, [3], '2026-12-31'),
  makeEvent('Tanzen (4-6 Jahre)', 'Sporthalle Dänische Schule', addDays(monday, 2), '16:30', '17:30', 'event', true, [3], '2026-12-31'),
  makeEvent('HulaHop', 'Sporthalle Dänische Schule', addDays(monday, 2), '18:00', '19:30', 'training', true, [3], '2026-12-31'),
  makeEvent('Step Aerobic Frisia 03', 'Sporthalle Dänische Schule', addDays(monday, 2), '19:30', '21:00', 'training', true, [3], '2026-12-31'),
  makeEvent('Friisk Foriining Bjarnefloose', 'Sporthalle Dänische Schule', addDays(monday, 3), '14:00', '16:00', 'event', true, [4], '2026-12-31'),
  makeEvent('Fitnesstraining', 'Sporthalle Dänische Schule', addDays(monday, 3), '16:00', '18:00', 'training', true, [4], '2026-12-31'),
  makeEvent('Kinderturnen (4-6 Jahre)', 'Kleine Halle Risum', addDays(monday, 0), '15:00', '16:30', 'event', true, [1], '2026-12-31'),
  makeEvent('Turnen Mädchen', 'Kleine Halle Risum', addDays(monday, 0), '16:30', '17:30', 'training', true, [1], '2026-12-31'),
  makeEvent('Fit for Fire', 'Kleine Halle Risum', addDays(monday, 0), '18:30', '19:30', 'training', true, [1], '2026-12-31'),
  makeEvent('Indiaka', 'Kleine Halle Risum', addDays(monday, 0), '20:00', '21:00', 'training', true, [1], '2026-12-31'),
  makeEvent('Eltern u. Kind Turnen', 'Kleine Halle Risum', addDays(monday, 1), '15:00', '16:00', 'event', true, [2], '2026-12-31'),
  makeEvent('Eltern u. Kind Turnen', 'Kleine Halle Risum', addDays(monday, 1), '16:00', '17:00', 'event', true, [2], '2026-12-31'),
  makeEvent('Cheerleader Juniors (12-16 Jahre)', 'Kleine Halle Risum', addDays(monday, 1), '17:00', '18:30', 'training', true, [2], '2026-12-31'),
  makeEvent('Thaiboxen', 'Kleine Halle Risum', addDays(monday, 1), '18:30', '20:00', 'training', true, [2], '2026-12-31'),
  makeEvent('Locker v. Hocker', 'Kleine Halle Risum', addDays(monday, 2), '10:00', '11:00', 'training', true, [3], '2026-12-31'),
  makeEvent('Cheerleader PeeWees (6-12 Jahre)', 'Kleine Halle Risum', addDays(monday, 2), '17:00', '18:30', 'training', true, [3], '2026-12-31'),
  makeEvent('Cheerleading - Frisia Valkyries', 'Kleine Halle Risum', addDays(monday, 2), '18:30', '20:00', 'training', true, [3], '2026-12-31'),
  makeEvent('Cheerleading - Frisia Valkyries', 'Kleine Halle Risum', addDays(monday, 2), '20:00', '21:00', 'training', true, [3], '2026-12-31'),
  makeEvent('Er & Sie Turnen', 'Kleine Halle Lindholm', addDays(monday, 0), '18:00', '19:30', 'training', true, [1], '2026-12-31'),
  makeEvent('Tischtennis Punktspiele und Training Frauen', 'Kleine Halle Lindholm', addDays(monday, 0), '19:30', '21:30', 'training', true, [1], '2026-12-31'),
  makeEvent('Ab November: Kinder- und Jugend-Selbstbehauptung', 'Kleine Halle Lindholm', addDays(monday, 1), '17:30', '18:30', 'event', true, [2], '2026-12-31'),
  makeEvent('Gymnastik Frauen', 'Kleine Halle Lindholm', addDays(monday, 1), '19:00', '20:00', 'training', true, [2], '2026-12-31'),
  makeEvent('Damengymnastik mit den Knackigen ab 50', 'Kleine Halle Lindholm', addDays(monday, 2), '17:00', '18:00', 'training', true, [3], '2026-12-31'),
  makeEvent('Rückengymnastik/Yoga/Pilates', 'Kleine Halle Lindholm', addDays(monday, 2), '18:00', '19:30', 'training', true, [3], '2026-12-31'),
  makeEvent('Wirbelsäulengymnastik Männer', 'Kleine Halle Lindholm', addDays(monday, 2), '19:00', '20:00', 'training', true, [3], '2026-12-31'),
  makeEvent('Wirbelsäulengymnastik Frauen', 'Kleine Halle Lindholm', addDays(monday, 2), '20:00', '21:00', 'training', true, [3], '2026-12-31'),
  makeBiweekly('Tanzen DRK (alle 2 Wochen)', 'Kleine Halle Lindholm', addDays(monday, 3), '14:00', '16:00', 'event', true, [4], '2026-12-31')
]; const oneOff = [
  makeEvent('Sommerferien - Halle gesperrt', 'Friesenhalle', new Date(2026, 6, 4), '08:00', '22:00', 'event', false, []),
  makeEvent('Sommerferien - Halle gesperrt', 'Friesenhalle', new Date(2026, 6, 5), '08:00', '22:00', 'event', false, []),
  makeEvent('Sommerferien - Halle gesperrt', 'Friesenhalle', new Date(2026, 6, 11), '08:00', '22:00', 'event', false, []),
  makeEvent('Sommerferien - Halle gesperrt', 'Friesenhalle', new Date(2026, 6, 12), '08:00', '22:00', 'event', false, []),
  makeEvent('Sommerferien - Halle gesperrt', 'Friesenhalle', new Date(2026, 6, 18), '08:00', '22:00', 'event', false, []),
  makeEvent('Sommerferien - Halle gesperrt', 'Friesenhalle', new Date(2026, 6, 19), '08:00', '22:00', 'event', false, []),
  makeEvent('Sommerferien - Halle gesperrt', 'Friesenhalle', new Date(2026, 6, 25), '08:00', '22:00', 'event', false, []),
  makeEvent('Sommerferien - Halle gesperrt', 'Friesenhalle', new Date(2026, 6, 26), '08:00', '22:00', 'event', false, []),
  makeEvent('weibl. Jug. C - HSG SZOWW', 'Friesenhalle', new Date(2026, 8, 5), '13:00', '15:00', 'game', false, []),
  makeEvent('weibl. Jug. D - Handewitter SV', 'Friesenhalle', new Date(2026, 8, 5), '11:30', '13:00', 'game', false, []),
  makeEvent('weibl. Jug. A - Nordau', 'Friesenhalle', new Date(2026, 8, 12), '17:00', '19:00', 'game', false, []),
  makeEvent('w. J. D Trainingslager', 'Friesenhalle', new Date(2026, 7, 11), '09:00', '14:00', 'event', false, []),
  makeEvent('w. J. D Trainingslager', 'Friesenhalle', new Date(2026, 7, 12), '09:00', '14:00', 'event', false, []),
  makeEvent('Herbstmarkt', 'Friesenhalle', new Date(2026, 8, 19), '08:00', '22:00', 'event', false, []),
  makeEvent('Sporteln', 'Friesenhalle', new Date(2026, 8, 20), '10:00', '12:00', 'event', false, []),
  makeEvent('weibl. Jug. E - Mildstedt', 'Friesenhalle', new Date(2026, 8, 26), '10:30', '12:00', 'game', false, []),
  makeEvent('weibl. Jug. D - Treia-Jübek', 'Friesenhalle', new Date(2026, 8, 26), '12:00', '14:00', 'game', false, []),
  makeEvent('weibl. Jug. C - Schwabstedt', 'Friesenhalle', new Date(2026, 8, 26), '14:00', '16:00', 'game', false, []),
  makeEvent('weibl. Jug. B - Pahlhude/Tellingstedt', 'Friesenhalle', new Date(2026, 8, 26), '16:00', '18:00', 'game', false, []),
  makeEvent('Damen 2 - Bredstedt 2', 'Friesenhalle', new Date(2026, 8, 26), '18:00', '20:00', 'game', false, []),
  makeEvent('Handball Damen Spiel', 'Friesenhalle', new Date(2026, 7, 28), '20:00', '22:00', 'game', false, []),
  makeEvent('weibl. Jug. C1 Testspiel', 'Friesenhalle', new Date(2026, 7, 29), '12:00', '15:00', 'game', false, []),
  makeEvent('Damen 2 - Munkbrarup', 'Friesenhalle', new Date(2026, 7, 30), '15:00', '17:00', 'game', false, [])
]; return weeklyEvents.concat(oneOff); }
function makeEvent(title, hall, date, start, end, type, recurring, days, until = '') { return { id: crypto.randomUUID(), title, hall, date: isoDate(date), start, end, type, recurring, days, frequency: 'weekly', until }; }
function makeBiweekly(title, hall, date, start, end, type, recurring, days, until = '') { const event = makeEvent(title, hall, date, start, end, type, recurring, days, until); event.frequency = 'biweekly'; return event; }
function addDays(date, number) { const result = new Date(date); result.setDate(result.getDate() + number); return result; }
function save() { localStorage.setItem(storageKey, JSON.stringify(events)); }
function parseSheetDate(value) {
  const parts = String(value).split(/[./-]/);
  if (parts.length !== 3) return '';
  if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  return `${parts[2].length === 2 ? `20${parts[2]}` : parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}
function parseSheetEvents(rows) {
  const dayNumbers = { Sonntag: 0, Montag: 1, Dienstag: 2, Mittwoch: 3, Donnerstag: 4, Freitag: 5, Samstag: 6 };
  return rows.map(row => {
    const recurring = String(row.Wiederholung || '').toLowerCase().includes('woche');
    const type = String(row.Art || '').toLowerCase().includes('spiel') ? 'game' : String(row.Art || '').toLowerCase().includes('veranstaltung') ? 'event' : 'training';
    return { id: crypto.randomUUID(), title: row.Termin || 'Termin', hall: row.Halle || halls[0], date: parseSheetDate(row.Datum), start: row.Beginn || '17:00', end: row.Ende || '18:00', type, recurring, days: recurring ? [dayNumbers[row.Wochentag]] : [], frequency: String(row.Wiederholung || '').toLowerCase().includes('2') ? 'biweekly' : 'weekly', until: parseSheetDate(row['Gültig bis']) };
  }).filter(event => event.date && event.hall);
}
async function loadGoogleEvents() {
  try {
    const response = await fetch(googleSheetUrl);
    if (!response.ok) throw new Error(`Google antwortet mit ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Unerwartetes Datenformat');
    const imported = parseSheetEvents(rows);
    if (imported.length) { events = imported; save(); render(); toast('Google-Termine geladen.'); }
  } catch (error) {
    console.warn('Google-Termine konnten nicht geladen werden:', error);
  }
}
function occurrences(from, to) { const result = []; events.forEach(event => { const first = new Date(`${event.date}T00:00:00`); const limit = event.until ? new Date(`${event.until}T23:59:59`) : to; for (let date = new Date(from); date <= to && date <= limit; date = addDays(date, 1)) { const matches = event.recurring ? (event.days || []).includes(date.getDay()) && date >= first : isoDate(date) === event.date; const weeks = Math.floor((date - first) / 604800000); if (matches && (!event.recurring || event.frequency !== 'biweekly' || weeks % 2 === 0)) result.push({ ...event, occurrenceDate: isoDate(date) }); } }); return result; }
function renderMonth() {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const gridStart = weekStart(monthStart);
  const gridEnd = addDays(weekStart(addDays(monthEnd, 1)), 6);
  const visible = occurrences(gridStart, gridEnd).filter(event => hallFilter.value === 'all' || event.hall === hallFilter.value);
  document.querySelector('#weekTitle').textContent = formatDate(monthStart, { month: 'long', year: 'numeric' });
  document.querySelector('#dateRange').textContent = `${formatDate(monthStart, { day: '2-digit', month: '2-digit', year: '2-digit' })} - ${formatDate(monthEnd, { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
  document.querySelector('#eventCount').textContent = `${visible.length} ${visible.length === 1 ? 'Termin' : 'Termine'}`;
  const weekdays = dayNames.slice(1).concat(dayNames[0]).map(day => `<div class="month-weekday">${day}</div>`).join('');
  const cells = [];
  for (let date = new Date(gridStart); date <= gridEnd; date = addDays(date, 1)) {
    const dayEvents = visible.filter(event => event.occurrenceDate === isoDate(date));
    const classes = `${date.getMonth() !== monthStart.getMonth() ? 'other-month' : ''} ${isoDate(date) === isoDate(new Date()) ? 'today' : ''}`;
    const cards = dayEvents.slice(0, 5).map(event => `<div class="month-event ${hallClasses[event.hall] || ''}" title="${event.title} · ${event.start} - ${event.end}">${event.start} ${event.title}</div>`).join('');
    const more = dayEvents.length > 5 ? `<div class="month-more">+ ${dayEvents.length - 5} weitere</div>` : '';
    cells.push(`<div class="month-day ${classes}"><div class="month-day-number">${date.getDate()}</div>${cards}${more}</div>`);
  }
  planner.innerHTML = `<div class="month-grid">${weekdays}${cells.join('')}</div>`;
}
function render() {
  const view = document.querySelector('#viewSelect').value;
  if (view === 'month') { renderMonth(); return; }
  const isDay = view === 'day';
  const start = isDay ? currentDate : weekStart(currentDate);
  const end = isDay ? currentDate : addDays(start, 6);
  const visible = occurrences(start, end).filter(event => hallFilter.value === 'all' || event.hall === hallFilter.value);
  const range = isDay
    ? formatDate(start, { day: '2-digit', month: '2-digit', year: '2-digit' })
    : `${formatDate(start, { day: '2-digit', month: '2-digit', year: '2-digit' })} - ${formatDate(end, { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
  document.querySelector('#dateRange').textContent = range;
  document.querySelector('#weekTitle').textContent = isDay ? dayNamesLong[start.getDay()] : 'Diese Woche';
  document.querySelector('#eventCount').textContent = `${visible.length} ${visible.length === 1 ? 'Termin' : 'Termine'}`;
  const days = isDay ? [start] : Array.from({ length: 7 }, (_, index) => addDays(start, index));
  const headers = days.map(day => {
    const active = isoDate(day) === isoDate(new Date()) ? 'active' : '';
    return `<div class="day-head ${active}">${dayNames[day.getDay()]}<strong>${String(day.getDate()).padStart(2, '0')}</strong></div>`;
  }).join('');
  let html = `<div class="planner-grid ${isDay ? 'day-view' : ''}"><div class="day-head"></div>${headers}`;
  for (let hour = 8; hour <= 21; hour++) {
    html += `<div class="time-label">${String(hour).padStart(2, '0')}:00</div>`;
    html += days.map(day => {
      const dayEvents = visible.filter(event => event.occurrenceDate === isoDate(day) && Number(event.start.slice(0, 2)) === hour);
      const cards = dayEvents.map(event => `<article class="event ${event.type} ${hallClasses[event.hall] || ''}" data-id="${event.id}"><strong>${event.title}</strong><small>${event.start} - ${event.end} · ${event.hall}</small></article>`).join('');
      return `<div class="day-column">${cards}</div>`;
    }).join('');
  }
  planner.innerHTML = `${html}</div>`;
}
function openDialog(id = '') { const event = events.find(item => item.id === id); document.querySelector('#dialogTitle').textContent = event ? 'Termin bearbeiten' : 'Neuer Termin'; document.querySelector('#eventId').value = event?.id || ''; document.querySelector('#titleInput').value = event?.title || ''; document.querySelector('#hallInput').value = event?.hall || halls[0]; document.querySelector('#dateInput').value = event?.date || isoDate(currentDate); document.querySelector('#startInput').value = event?.start || '17:00'; document.querySelector('#endInput').value = event?.end || '18:30'; document.querySelector('#typeInput').value = event?.type || 'training'; document.querySelector('#recurringInput').checked = event?.recurring || false; document.querySelector('#frequencyInput').value = event?.frequency || 'weekly'; document.querySelector('#untilInput').value = event?.until || ''; document.querySelectorAll('#dayPicker input').forEach(input => input.checked = event?.days?.includes(Number(input.value)) || (!event && Number(input.value) === new Date().getDay())); toggleRecurrence(); document.querySelector('#deleteButton').style.visibility = event ? 'visible' : 'hidden'; dialog.showModal(); }
function toggleRecurrence() { document.querySelector('#recurrenceFields').classList.toggle('visible', document.querySelector('#recurringInput').checked); }
function toast(message) { const item = document.querySelector('#toast'); item.textContent = message; item.classList.add('show'); setTimeout(() => item.classList.remove('show'), 2200); }
['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].forEach((day, index) => { const label = document.createElement('label'); label.className = 'day-choice'; label.innerHTML = `<input type="checkbox" value="${index}">${day}`; document.querySelector('#dayPicker').append(label); });
document.querySelector('#recurringInput').addEventListener('change', toggleRecurrence); document.querySelector('#previousWeek').addEventListener('click', () => { const view = document.querySelector('#viewSelect').value; currentDate = view === 'month' ? new Date(currentDate.getFullYear(), currentDate.getMonth() - 1
