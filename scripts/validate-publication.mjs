const expectedSections = ['overview', 'our-work', 'whats-next', 'open-questions'];

export function validatePublication(publication, records) {
  if (!Array.isArray(publication.gapPublications) || !publication.gapPublications.length) throw new Error('A gap publication is required');
  const ids = new Set();
  for (const gapPublication of publication.gapPublications) {
    if (records[gapPublication.gapId]?.schema !== 'gap') throw new Error(`Publication has no gap: ${gapPublication.gapId}`);
    const sections = [...gapPublication.sections].sort((a, b) => a.order - b.order);
    if (sections.map(section => section.id).join(',') !== expectedSections.join(',')) throw new Error(`Incomplete editorial sections for ${gapPublication.gapId}`);
    for (const item of gapPublication.items) {
      if (ids.has(item.id)) throw new Error(`Duplicate editorial item: ${item.id}`);
      ids.add(item.id);
      if (item.gapId !== gapPublication.gapId || !sections.some(section => section.id === item.section)) throw new Error(`Invalid placement: ${item.id}`);
      if (!item.title?.trim() || !item.body?.trim() || !Number.isInteger(item.order) || item.order < 1) throw new Error(`Incomplete editorial item: ${item.id}`);
      const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value.slice(0,10);
      if (!validDate(item.createdAt) || !validDate(item.updatedAt) || Date.parse(item.updatedAt)<Date.parse(item.createdAt)) throw new Error(`Invalid editorial dates: ${item.id} (updatedAt must be on or after createdAt)`);
      if (!['published', 'draft', 'retired'].includes(item.status)) throw new Error(`Invalid editorial status: ${item.id}`);
      for (const id of item.relatedRecordIds || []) if (!records[id]) throw new Error(`Missing related record ${id} in ${item.id}`);
      if (item.image && (!item.image.src?.startsWith('/') || !item.image.alt?.trim() || !item.image.caption?.trim())) throw new Error(`Invalid editorial image: ${item.id}`);
      if (item.paragraphs && (!Array.isArray(item.paragraphs) || item.paragraphs.some(text => typeof text !== 'string' || !text.trim()))) throw new Error(`Invalid editorial paragraphs: ${item.id}`);
      if (item.table) {
        const { caption, columns, rows } = item.table;
        if (!caption?.trim() || !Array.isArray(columns) || !columns.length || columns.some(value => typeof value !== 'string' || !value.trim()) || !Array.isArray(rows) || !rows.length || rows.some(row => !Array.isArray(row) || row.length !== columns.length || row.some(value => typeof value !== 'string' || !value.trim()))) throw new Error(`Invalid editorial table: ${item.id}`);
      }
    }
    for (const section of sections) if (!gapPublication.items.some(item => item.section === section.id && item.status === 'published')) throw new Error(`Empty published section: ${section.id}`);
  }
}
