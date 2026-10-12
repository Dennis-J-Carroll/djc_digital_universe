const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const page = fs.readFileSync(path.join(__dirname, '../../static/apps/repo-tester.html'), 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/)[1];

test('repo-tester renders untrusted scan text safely and opens evidence drawer', () => {
  const dom = new JSDOM(page, {
    url: 'https://dennisjcarroll.com/apps/repo-tester.html',
    runScripts: 'outside-only',
  });
  const { window } = dom;
  window.document.getElementById('finding-drawer').showModal = function () { this.setAttribute('open', ''); };

  window.fixtureData = {
    repo_name: '<img src=x onerror=alert(1)>',
    repo_type: 'react',
    file_count: 10,
    flag_density: 6,
    flag_density_baseline: 4,
    scanned_at: '2026-10-11T12:00:00Z',
    summary: { CRITICAL: 0, HIGH: 1, MEDIUM: 0, LOW: 0, INFO: 0 },
    verdict_summary: { bad: 1, warn: 0, ok: 0 },
    scan_warnings: [],
    library_targets: [{ name: '<svg onload=alert(1)>', count: 2, note: 'untrusted' }],
    findings: [{
      severity: 'HIGH', verdict: 'bad', scanner: 'supply_chain',
      title: '<img src=x onerror=alert(2)>', detail: 'OSV version match',
      file_path: '<svg onload=alert(3)>', package: 'diff', resolved_version: '8.0.2',
      advisory: { id: 'GHSA-73rr-hh4g-fpgx', affected: [
        { type: 'SEMVER', events: [{ introduced: '6.0.0' }, { fixed: '8.0.3' }] }
      ], fixed: ['8.0.3'] },
      evidence: [{ type: 'osv_version_query', fetched_at: '2026-10-11T12:00:00Z' }],
      dependency_chain: ['parent', 'diff'],
      remediation: 'Review upstream fix', learn: ['lockfiles'],
    }],
  };
  window.eval(`${script}\ncurrentScan = window.fixtureData; renderDashboard(currentScan);`);
  assert.equal(window.document.querySelector('#dashboard img, #dashboard svg'), null);
  assert.match(window.document.getElementById('dashboard').textContent, /<img src=x onerror=alert\(1\)>/);
  assert.match(window.document.getElementById('dashboard').textContent, /How calculated/);

  window.document.querySelector('[data-finding-index="0"]').click();
  const drawer = window.document.getElementById('finding-drawer');
  assert.equal(drawer.hasAttribute('open'), true);
  assert.equal(drawer.querySelector('img, svg'), null);
  assert.deepEqual([...drawer.querySelectorAll('h3')].map(node => node.textContent), [
    'Why flagged', 'How verified', 'What to do', 'What to learn'
  ]);
  assert.match(drawer.textContent, /parent → diff/);
  assert.match(drawer.textContent, /A lockfile records selected package versions/);
  assert.equal(drawer.querySelector('a').href, 'https://osv.dev/vulnerability/GHSA-73rr-hh4g-fpgx');
  dom.window.close();
});

test('local preview and demo URL show labeled sample without an API request', () => {
  const previewUrls = [
    'http://localhost:8000/apps/repo-tester.html',
    'file:///tmp/repo-tester.html',
    'https://dennisjcarroll.com/apps/repo-tester.html?demo=1',
  ];
  for (const url of previewUrls) {
    const dom = new JSDOM(page, { url, runScripts: 'outside-only' });
    const { window } = dom;
    let requests = 0;
    window.fetch = () => { requests += 1; throw new Error('Preview contacted API'); };
    window.eval(script);

    assert.equal(window.document.getElementById('app').style.display, 'flex', url);
    assert.equal(window.document.getElementById('boot-screen').style.display, 'none', url);
    assert.equal(window.document.getElementById('scan-btn').textContent, 'DEMO SCAN', url);
    assert.match(window.document.getElementById('status-text').textContent, /DEMO PREVIEW/, url);
    assert.match(window.document.getElementById('dashboard').textContent, /DEMO DATA — simulated results/, url);
    assert.ok(window.document.querySelector('[data-finding-index]'), url);
    assert.equal(requests, 0, url);
    dom.window.close();
  }
});

test('published page defaults to real scans', () => {
  const dom = new JSDOM(page, {
    url: 'https://dennisjcarroll.com/apps/repo-tester.html',
    runScripts: 'outside-only',
  });
  const { window } = dom;
  const demoMode = window.eval(`${script}\nDEMO_MODE`);
  assert.equal(demoMode, false);
  assert.equal(window.document.getElementById('scan-btn').textContent, 'SCAN');
  const liveExport = window.eval('prepareReportDownload({ repo_name: "owner/repo", scanned_at: "2026-10-12T12:00:00Z" }, "json")');
  assert.equal(JSON.parse(liveExport.content).export_metadata.mode, 'live_scan');
  dom.window.close();
});

test('preview scan button generates data without contacting backend', async () => {
  const dom = new JSDOM(page, {
    url: 'http://localhost:8000/apps/repo-tester.html',
    runScripts: 'outside-only',
  });
  const { window } = dom;
  let requests = 0;
  window.fetch = () => { requests += 1; throw new Error('Preview contacted API'); };
  window.eval(script);
  window.setTimeout = callback => { callback(); return 0; };
  window.document.getElementById('repo-url').value = 'https://github.com/example/another-simulated-repo';

  await window.eval('runScan()');

  assert.equal(requests, 0);
  assert.match(window.document.getElementById('status-text').textContent, /DEMO READY/);
  assert.match(window.document.getElementById('dashboard').textContent, /another-simulated-repo/);
  assert.match(window.document.getElementById('dashboard').textContent, /DEMO DATA — simulated results/);
  dom.window.close();
});

test('report exports preserve evidence and escape untrusted HTML', () => {
  const dom = new JSDOM(page, { url: 'file:///tmp/repo-tester.html', runScripts: 'outside-only' });
  const { window } = dom;
  window.eval(script);
  window.reportFixture = {
    url: 'https://github.com/owner/repo',
    repo_name: 'owner/<img src=x onerror=alert(1)>',
    scanned_at: '2026-10-12T12:00:00Z',
    file_count: 10,
    flag_density: 6,
    summary: { HIGH: 1 },
    verdict_summary: { bad: 1 },
    scan_warnings: ['<svg onload=alert(2)>'],
    library_targets: [{ name: 'diff', count: 2, note: 'declared twice' }],
    findings: [{
      title: '<img src=x onerror=alert(3)>', detail: '<script>alert(4)</script>',
      severity: 'HIGH', verdict: 'bad', scanner: 'supply_chain',
      file_path: 'package-lock.json', package: 'diff', resolved_version: '8.0.2',
      dependency_chain: ['root', 'diff'], remediation: 'Upgrade diff',
      advisory: {
        id: 'GHSA-73rr-hh4g-fpgx', source_url: 'https://osv.dev/vulnerability/GHSA-73rr-hh4g-fpgx',
        affected: [{ type: 'SEMVER', events: [{ introduced: '6.0.0' }, { fixed: '8.0.3' }] }],
        fixed: ['8.0.3'],
      },
      evidence: [{ type: 'osv_version_query', detail: '<script>alert(5)</script>' }],
      learn: ['lockfiles'],
    }],
  };

  const json = window.eval('prepareReportDownload(window.reportFixture, "json")');
  const exported = JSON.parse(json.content);
  assert.equal(json.mimeType, 'application/json;charset=utf-8');
  assert.equal(json.filename, 'repo-tester-owner-img-src-x-onerror-alert-1-2026-10-12.json');
  assert.equal(exported.export_metadata.mode, 'simulated');
  assert.equal(exported.findings[0].resolved_version, '8.0.2');
  assert.equal(exported.findings[0].evidence[0].detail, '<script>alert(5)</script>');
  assert.equal(window.reportFixture.export_metadata, undefined);

  const html = window.eval('prepareReportDownload(window.reportFixture, "html")');
  const report = new JSDOM(html.content).window.document;
  assert.equal(html.mimeType, 'text/html;charset=utf-8');
  assert.equal(report.querySelector('script, img, svg'), null);
  assert.match(report.body.textContent, /SIMULATED DEMO REPORT/);
  assert.match(report.body.textContent, /Committed lockfile version/);
  assert.match(report.body.textContent, /package-lock\.json/);
  assert.match(report.body.textContent, /<script>alert\(5\)<\/script>/);
  assert.equal(report.querySelector('a').href, 'https://osv.dev/vulnerability/GHSA-73rr-hh4g-fpgx');
  dom.window.close();
});

test('export buttons download current report without contacting scanner API', () => {
  const dom = new JSDOM(page, { url: 'http://localhost:8000/apps/repo-tester.html', runScripts: 'outside-only' });
  const { window } = dom;
  let requests = 0;
  const downloads = [];
  const revoked = [];
  window.fetch = () => { requests += 1; throw new Error('Export contacted API'); };
  window.URL.createObjectURL = blob => {
    assert.ok(blob.size > 0);
    return `blob:report-${downloads.length}`;
  };
  window.URL.revokeObjectURL = url => revoked.push(url);
  window.HTMLAnchorElement.prototype.click = function () {
    downloads.push({ filename: this.download, href: this.href });
  };
  window.eval(script);
  window.setTimeout = callback => { callback(); return 0; };

  window.document.querySelector('[data-report-format="html"]').click();
  window.document.querySelector('[data-report-format="json"]').click();

  assert.equal(requests, 0);
  assert.deepEqual(downloads.map(item => path.extname(item.filename)), ['.html', '.json']);
  assert.deepEqual(revoked, ['blob:report-0', 'blob:report-1']);
  assert.equal(window.document.querySelectorAll('a[download]').length, 0);
  dom.window.close();
});
