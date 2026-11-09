// Druckansicht (PDF) der Friesenhallen-Belegung für den Adminbereich.
// Rechnet Termine wie der öffentliche Plan aus (Wiederholungen, "Täglich", Ausblenden)
// und öffnet den Druckdialog des Browsers – dort "Als PDF speichern" wählen.
(function () {
  const HALLE = 'Friesenhalle';
  const TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const ART = { training: 'Training', game: 'Spiel', event: 'Veranstaltung' };
  const DAY_NUMBERS = { Sonntag: 0, Montag: 1, Dienstag: 2, Mittwoch: 3, Donnerstag: 4, Freitag: 5, Samstag: 6 };

  // ---------- Datum / Zeit ----------
  function startOfDay(date) { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; }
  function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
  function weekStart(date) { const d = startOfDay(date); const day = d.getDay(); d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); return d; }
  function isoDate(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function deDate(d, mitJahr = true) { return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${mitJahr ? d.getFullYear() : ''}`; }
  function kalenderwoche(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    return Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
  }
  function minutes(time) { const [h, m] = String(time || '').split(':').map(Number); return (h || 0) * 60 + (m || 0); }
  function zeit(time) { const m = String(time || '').match(/(\d{1,2}):(\d{2})/); return m ? `${m[1].padStart(2, '0')}:${m[2]}` : String(time || ''); }
  function parseDatum(value) {
    const parts = String(value || '').trim().split(/[./-]/);
    if (parts.length !== 3) return '';
    if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    return `${parts[2].length === 2 ? `20${parts[2]}` : parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  // ---------- Termine wie im öffentlichen Plan berechnen ----------
  function zuTermin(row) {
    const wdh = String(row.Wiederholung || '').toLowerCase();
    const recurring = wdh.includes('woche');
    const artText = String(row.Art || '').toLowerCase();
    const vorrang = String(row['Überschreibt'] || '').toLowerCase();
    return {
      title: row.Termin || 'Termin', hall: row.Halle || '', date: parseDatum(row.Datum),
      start: zeit(row.Beginn) || '17:00', end: zeit(row.Ende) || '18:00',
      type: artText.includes('spiel') ? 'game' : artText.includes('veranstaltung') ? 'event' : 'training',
      recurring,
      days: recurring ? (/t(ä|ae)glich/i.test(row.Wochentag || '') ? [0, 1, 2, 3, 4, 5, 6] : [DAY_NUMBERS[row.Wochentag]]) : [],
      frequency: wdh.includes('2') ? 'biweekly' : 'weekly',
      until: parseDatum(row['Gültig bis']),
      override: vorrang.includes('tag') ? 'tag' : vorrang.includes('zeit') ? 'zeitraum' : ''
    };
  }
  function termineImZeitraum(rows, von, bis) {
    const events = rows.map(zuTermin).filter(e => e.date && e.hall === HALLE);
    const result = [];
    events.forEach(event => {
      const first = new Date(`${event.date}T00:00:00`);
      const limit = event.until ? new Date(`${event.until}T23:59:59`) : bis;
      for (let date = new Date(von); date <= bis && date <= limit; date = addDays(date, 1)) {
        const matches = event.recurring ? event.days.includes(date.getDay()) && date >= first : isoDate(date) === event.date;
        const weeks = Math.floor((date - first) / 604800000);
        if (matches && (!event.recurring || event.frequency !== 'biweekly' || weeks % 2 === 0)) result.push({ ...event, occurrenceDate: isoDate(date) });
      }
    });
    const overrides = result.filter(e => e.override);
    return result
      .filter(item => item.override || !overrides.some(o => o.occurrenceDate === item.occurrenceDate &&
        (o.override === 'tag' || (minutes(item.start) < minutes(o.end) && minutes(o.start) < minutes(item.end)))))
      .sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate) || minutes(a.start) - minutes(b.start));
  }

  // ---------- Seitenaufbau ----------
  function kopf(titel, unter) { return `<header><h1>${esc(titel)}</h1><p>${esc(unter)}</p></header>`; }
  function wochenSeite(liste, montag, fuss) {
    const sonntag = addDays(montag, 6);
    let spalten = '';
    for (let i = 0; i < 7; i++) {
      const tag = addDays(montag, i);
      const t = liste.filter(e => e.occurrenceDate === isoDate(tag));
      spalten += `<div class="tag"><h2>${TAGE[tag.getDay()]}<span>${deDate(tag, false)}</span></h2>` +
        (t.length ? t.map(e => `<div class="t ${e.type}"><b>${e.start} – ${e.end}</b><div>${esc(e.title)}</div>${e.type !== 'training' ? `<i>${ART[e.type]}</i>` : ''}</div>`).join('')
          : '<p class="leer">Keine Termine</p>') + '</div>';
    }
    return `<section class="seite">${kopf(`${HALLE} – Belegung`, `SV Frisia 03 · ${deDate(montag)} – ${deDate(sonntag)} (KW ${kalenderwoche(montag)})`)}<div class="woche">${spalten}</div>${fuss}</section>`;
  }
  function monatsSeite(liste, ersterTag, fuss) {
    const letzterTag = new Date(ersterTag.getFullYear(), ersterTag.getMonth() + 1, 0);
    const start = weekStart(ersterTag), ende = addDays(weekStart(letzterTag), 6);
    let zellen = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => `<div class="wt">${d}</div>`).join('');
    for (let tag = new Date(start); tag <= ende; tag = addDays(tag, 1)) {
      const anders = tag.getMonth() !== ersterTag.getMonth();
      const t = anders ? [] : liste.filter(e => e.occurrenceDate === isoDate(tag));
      zellen += `<div class="mt${anders ? ' anders' : ''}"><div class="nr">${tag.getDate()}</div>` +
        t.map(e => `<div class="m ${e.type}">${e.start} ${esc(e.title)}</div>`).join('') + '</div>';
    }
    const reihen = Math.round((ende - start) / 604800000) + 1;
    return `<section class="seite">${kopf(`${HALLE} – Belegung ${MONATE[ersterTag.getMonth()]} ${ersterTag.getFullYear()}`, `SV Frisia 03 · ${deDate(ersterTag)} – ${deDate(letzterTag)}`)}<div class="monat" style="grid-template-rows:auto repeat(${reihen},1fr)">${zellen}</div>${fuss}</section>`;
  }
  const CSS = `@page{size:A4 landscape;margin:10mm}
*{box-sizing:border-box}body{font:9pt/1.3 "Segoe UI",Arial,sans-serif;color:#173b3f;margin:0}
.seite{height:189mm;display:flex;flex-direction:column;break-after:page}.seite:last-of-type{break-after:auto}
header{background:#f4c400;padding:8px 14px;border-radius:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:baseline;-webkit-print-color-adjust:exact;print-color-adjust:exact}
header h1{margin:0;font-size:16pt;color:#000}header p{margin:0;font-size:10pt;color:#000}
.woche{flex:1;display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.tag{border:1px solid #e5dfd5;border-radius:5px;padding:5px}
h2{font-size:10.5pt;margin:0 0 5px;padding-bottom:3px;border-bottom:2px solid #f4c400;display:flex;justify-content:space-between}h2 span{font-weight:400;color:#6f8180}
.t{background:#fdf3c4;border-left:3px solid #b48e00;border-radius:3px;padding:4px 5px;margin-bottom:4px;break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.t b{display:block;font-size:8.5pt}.t i{display:block;font-style:normal;font-size:7.5pt;font-weight:600;color:#9a6b00}
.t.game{background:#f4c400;border-left-color:#000}.t.game i{color:#000}
.leer{color:#6f8180;font-style:italic;margin:4px 2px}
.monat{flex:1;display:grid;grid-template-columns:repeat(7,1fr);gap:3px;min-height:0}
.wt{font-weight:700;font-size:9pt;padding:2px 4px;border-bottom:2px solid #f4c400}
.mt{border:1px solid #e5dfd5;border-radius:4px;padding:2px 3px;overflow:hidden;min-height:0}.mt.anders{background:#f7f3ed}
.nr{font-weight:700;font-size:8.5pt}
.m{font-size:6.8pt;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#fdf3c4;border-radius:2px;padding:0 2px;margin-top:1px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.m.game{background:#f4c400;font-weight:600}
footer{margin-top:5px;font-size:7.5pt;color:#6f8180}`;

  const LEISTE = '<div class="leiste"><button onclick="window.print()">🖨 Drucken / als PDF sichern</button>' +
    '<span>iPhone/iPad: im Druckfenster oben rechts auf <b>Teilen</b> tippen → <b>In Dateien sichern</b> – oder direkt drucken.</span></div>';
  const LEISTE_CSS = `body{padding:14px}.leiste{display:flex;gap:14px;align-items:center;margin-bottom:12px;font-size:15px}
.leiste button{font:600 18px Arial,sans-serif;padding:12px 20px;border:0;border-radius:8px;background:#173b3f;color:#fff}
@media print{body{padding:0}.leiste{display:none}}`;
  const MOBIL = typeof navigator !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  // modus: 'diese' | 'naechste' | 'zwei' | 'monat' | 'naechsterMonat'
  // mitLeiste: eigener Tab (Handy/Tablet) mit Knopf zum Drucken, der im Ausdruck verschwindet
  function dokument(rows, modus, heute = new Date(), mitLeiste = false) {
    const montag = weekStart(heute);
    const fuss = `<footer>Stand: ${deDate(heute)} · Quelle: Hallenplan (frisiahallen-hallenplan.github.io/hallenplan) · Spiele sind gelb hervorgehoben</footer>`;
    let seiten = '', dateiname = '';
    if (modus === 'monat' || modus === 'naechsterMonat') {
      const erster = new Date(heute.getFullYear(), heute.getMonth() + (modus === 'monat' ? 0 : 1), 1);
      const letzter = new Date(erster.getFullYear(), erster.getMonth() + 1, 0);
      seiten = monatsSeite(termineImZeitraum(rows, erster, letzter), erster, fuss);
      dateiname = `Friesenhalle_${MONATE[erster.getMonth()]}_${erster.getFullYear()}`;
    } else {
      const wochen = modus === 'diese' ? [montag] : modus === 'naechste' ? [addDays(montag, 7)] : [montag, addDays(montag, 7)];
      seiten = wochen.map(m => wochenSeite(termineImZeitraum(rows, m, addDays(m, 6)), m, fuss)).join('');
      dateiname = `Friesenhalle_KW${wochen.map(kalenderwoche).join('-')}`;
    }
    return `<!doctype html><html lang="de"><head><meta charset="utf-8">${mitLeiste ? '<meta name="viewport" content="width=1120">' : ''}<title>${dateiname}</title><style>${CSS}${mitLeiste ? LEISTE_CSS : ''}</style></head><body>${mitLeiste ? LEISTE : ''}${seiten}</body></html>`;
  }

  function drucken(rows, modus) {
    // iOS-Safari druckt aus einem iframe die ganze Seite – dort einen eigenen Tab öffnen
    if (MOBIL) {
      const tab = window.open('', '_blank');
      if (!tab) { alert('Bitte Pop-ups für diese Seite erlauben, um den Plan zu drucken.'); return; }
      tab.document.open();
      tab.document.write(dokument(rows, modus, new Date(), true));
      tab.document.close();
      return;
    }
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    frame.onload = () => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => frame.remove(), 60000);
    };
    frame.srcdoc = dokument(rows, modus);
    document.body.append(frame);
  }

  window.friesenhallenDruck = { drucken, dokument, termineImZeitraum };
})();
