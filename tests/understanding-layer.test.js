/** @jest-environment jsdom */
window.UL_ICONS = require('../static/apps/understanding-layer.icons.js');
const TRACE = require('../static/apps/understanding-layer.data.js');
window.UL_TRACE = TRACE;
const UL = require('../static/apps/understanding-layer.app.js');

test('computeStats returns correct counts', () => {
  const s = UL.computeStats(TRACE.events);
  expect(s.events).toBe(46);
  expect(s.toolCalls).toBe(TRACE.events.filter(e => e.kind === 'TOOL_CALL').length);
});
test('renderEventCard produces a card with kind badge and event id, no emoji', () => {
  const html = UL.renderEventCard(TRACE.events[0]);
  expect(html).toContain('ev-kind-badge');
  expect(html).toContain('e0');
  expect(html).not.toMatch(/\u{1F4AC}|\u{2699}|\u{1F4E5}/u); // no 💬 ⚙️ 📥
});
test('renderEventCard marks error events', () => {
  const errEvent = TRACE.events.find(e => e.isError);
  expect(UL.renderEventCard(errEvent)).toContain('error');
});
test('renderSummary shows the five summary cards', () => {
  const html = UL.renderSummary(UL.computeStats(TRACE.events));
  ['Events','Actors','Tool Calls','Fabricated','Annotated Events'].forEach(l => expect(html).toContain(l));
});
