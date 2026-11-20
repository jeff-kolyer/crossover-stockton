export const repo = 'https://github.com/jeff-kolyer/crossover-stockton';
export const stageNames = ['Exploring','Blocked','Enabling','Established'];
export const stages = {
  Exploring: 'A possible route is being checked with the people who can confirm it.',
  Blocked: 'A documented obstacle currently prevents someone from helping.',
  Enabling: 'Work is underway to remove a specific obstacle.',
  Established: 'A repeatable route has been demonstrated and documented.'
};
export const statuses = {open:'Open',in_progress:'In progress',waiting:'Waiting',done:'Done'};
export const taskIcons = {open:'circle',in_progress:'working',waiting:'waiting',done:'checkcircle'};
export const typeNames = {source_review:'Source review',field_observation:'Field observation',organization_contact:'Organization contact',follow_up:'Follow-up'};
export const sections = {help:'Help today',pathways:'Pathways',tasks:'Tasks',evidence:'Evidence'};
export const recordType = r => r.id.startsWith('WORK-') ? 'Tasks' : /^(FLD|CPRA|PLAN|EDT)-/.test(r.id) ? 'Activities' : 'Records';
export const typeIcon = category => ({Tasks:'clipboard',Activities:'note',Records:'file'}[category] || 'file');
const cardCopy = {
  'PW-01': {match:'Volunteer at Stockton Animal Services', title:'Volunteer at the animal shelter', summary:'Check how volunteers can walk shelter dogs or take one out for the day.', image:'shelter', alt:'A volunteer beside a shelter dog', official:'GOV-2026-007'},
  'PW-02': {match:'Direct kibble & clean water drop-off for street dogs', title:'Food and water for street dogs', summary:'Confirm what supplies are needed and how to get them to the dogs.', image:'food', alt:'Food being poured into bowls for dogs', official:'RESC-2026-005'},
  'PW-04': {match:'Analyze public records', title:'Analyze public records', summary:'Review 7,183 field-call cases to learn what follows a report about a dog.', image:'desk', alt:'Records and a notebook laid out on a desk'}
};
export function presentation(p, seed) {
  const entry=cardCopy[p.id];
  if (!entry || entry.match!==p.title) return {title:p.title,summary:p.actionDetails?.whatNeeded || p.condition || '',image:null};
  const sameCondition=seed?.pathways?.find(x=>x.id===p.id)?.condition===p.condition;
  return {...entry,summary:sameCondition?entry.summary:(p.actionDetails?.whatNeeded||p.condition||'')};
}
export const freshWindow = 48*60*60000;
export function checkedTime(p,sourceDate) {
  const value=p.availabilityCheckedAt || p.lastCheckedAt || (p.criteriaMet?.recent?p.updatedAt:'');
  const exact=Date.parse(value || '');
  if (Number.isFinite(exact)) return exact;
  if (p.freshness==='fresh' && Number.isFinite(p.freshMins) && p.freshMins>=0) return Date.parse(sourceDate)-p.freshMins*60000;
  return NaN;
}
export function ready(p, sourceDate, now=Date.now()) {
  if (p.stage!=='Established' || !p.criteriaMet?.steps || !(p.criteriaMet.confirmed || p.criteriaMet.completed) || !p.actionDetails?.howToHelp?.trim()) return false;
  const age=now-checkedTime(p,sourceDate);
  return age>=0 && age<freshWindow;
}
export function score(p, config) {
  return (config.confidenceCriteria || []).reduce((n,c)=>n+(p.criteriaMet?.[c.key]?c.points:0),0);
}
export function prettyDate(s, short=false) {
  if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return 'Undated';
  const v=new Date(s.slice(0,10)+'T12:00:00Z');
  return Number.isNaN(v.valueOf())?'Undated':v.toLocaleDateString('en-US',{month:'short',day:'numeric',...(short?{}:{year:'numeric'}),timeZone:'UTC'});
}
const validDate = d => /^\d{4}-\d{2}-\d{2}/.test(d||'')?d:'';
export function newest(records) {
  return [...records].sort((a,b)=>validDate(b.date).localeCompare(validDate(a.date)) || a.id.localeCompare(b.id));
}
export function normalizeTasks(catalog, ledger) {
  const ids=new Map(ledger.entries.map(e=>[e.sourceId,e.displayId]));
  return catalog.tasks.map(t=>({id:ids.get(t.id)||t.id,title:t.title,status:t.status,type:t.type,summary:t.list_context||'',instructions:t.instructions||'',basis:(t.basis_record_ids||[]).map(id=>ids.get(id)||id),started:t.started_at||''}));
}
export function validSnapshot(data) {
  if (!data || !/^[a-f0-9]{40}$/.test(data.sha) || !Array.isArray(data.config?.confidenceCriteria)) return false;
  return ['pathways','tasks','records'].every(key=>Array.isArray(data[key]) && data[key].every(x=>x?.id && x?.title) && new Set(data[key].map(x=>x.id)).size===data[key].length);
}
async function readJSON(url,signal) {
  const res=await fetch(url,{signal,cache:'no-cache',credentials:'omit',referrerPolicy:'no-referrer'});
  if (!res.ok) throw new Error('Source returned '+res.status);
  return res.json();
}
export async function checkRepository(current,signal) {
  const commit=await readJSON('https://api.github.com/repos/jeff-kolyer/crossover-stockton/commits/main',signal);
  if (commit.sha===current.sha) return current;
  if (!/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error('Invalid source revision');
  const base='https://raw.githubusercontent.com/jeff-kolyer/crossover-stockton/'+commit.sha+'/';
  const [pathways,config,catalog,ledger,records]=await Promise.all(['src/data/pathways.json','src/data/tracker-config.json','src/data/catalog-source.json','src/data/record-id-ledger.json','public/data/records.json'].map(f=>readJSON(base+f,signal)));
  const next={sha:commit.sha,asOf:commit.commit.committer.date,pathways,config,tasks:normalizeTasks(catalog,ledger),records};
  if (!validSnapshot(next)) throw new Error('Incomplete source data');
  return next;
}
