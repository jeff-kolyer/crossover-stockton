import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const script = (await readFile('public/preview/site-md.js', 'utf8')).replace(/\bstart\(\);\s*$/, '');
const story = JSON.parse(await readFile('public/site-config.json', 'utf8'));
const publication = JSON.parse(await readFile('public/data/records.json', 'utf8'));
const listing = { innerHTML: '' }, count = { textContent: '' };
const buttons = ['all', 'open', 'in_progress', 'waiting', 'proposed', 'under_development'].map(value => ({ dataset: { filter: value }, setAttribute(name, value) { this[name] = value; } }));
const document = {
  querySelector(selector) { return selector === '.listing-results' ? listing : count; },
  querySelectorAll() { return buttons; },
};
const context = { location: { pathname: '/street-dogs/tasks/', search: '' }, document, URLSearchParams, Intl, Date, console, story, publication };
runInNewContext(`${script}\nfeed=globalThis.story;records=Object.values(globalThis.publication.records);byId=new Map(records.map(item=>[item.id,item]));gap=records.find(item=>item.schema==='gap'&&item.fields.default);gapStory=feed.chapters.find(item=>item.id==='gap');menu=feed.silent.menu;globalThis.inspect={listingItems,listingPage,updateListingFilter,recordStatus};`, context);
const api = context.inspect;

test('task filters use published statuses and update visible rows and counts', () => {
  const items = api.listingItems('tasks');
  assert.ok(items.length > 3);
  assert.ok(api.listingPage('tasks').includes(`Actions <span class="work-visible-count">(${items.length})</span>`));
  const waiting = items.filter(item => api.recordStatus(item) === 'waiting');
  assert.ok(waiting.length > 0);
  api.updateListingFilter('waiting');
  assert.equal(count.textContent, `(${waiting.length})`);
  for (const item of waiting) assert.ok(listing.innerHTML.includes(item.title), item.id);
  for (const item of items.filter(item => api.recordStatus(item) !== 'waiting')) assert.ok(!listing.innerHTML.includes(`>${item.title}</strong>`), item.id);
  assert.equal(buttons.find(button => button.dataset.filter === 'waiting')['aria-pressed'], 'true');
});

test('improvement filters draw from initiative stages without demo records', () => {
  context.location.pathname = '/street-dogs/improvements/';
  const items = api.listingItems('improvements');
  const proposed = items.filter(item => api.recordStatus(item) === 'proposed');
  assert.ok(proposed.length > 0);
  api.updateListingFilter('proposed');
  assert.equal(count.textContent, `(${proposed.length})`);
  for (const item of proposed) assert.ok(listing.innerHTML.includes(item.title), item.id);
  assert.ok(!listing.innerHTML.includes('representative interactive prototype'));
});

test('activity, measurements, and findings keep their record meanings', () => {
  const activity = api.listingItems('activity');
  assert.ok(activity.length > 0);
  assert.ok(activity.every(item => item.schema === 'activity'));
  const metrics = api.listingItems('metrics');
  assert.ok(metrics.some(item => item.schema === 'measurement'));
  assert.ok(metrics.some(item => item.schema === 'claim'));
  context.location.pathname = '/street-dogs/metrics/';
  api.updateListingFilter('claim');
  assert.equal(count.textContent, `(${metrics.filter(item => item.schema === 'claim').length})`);
  assert.ok(listing.innerHTML.includes('No verified current count'));
  assert.ok(!listing.innerHTML.includes('3,106'));
  const findings = api.listingItems('findings');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].id, 'finding-new-facilities-impact-uncertain');
});
