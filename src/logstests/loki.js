import Loki from 'lokijs';
import MiniSearch from 'minisearch';

let db, logs, miniSearch;

export function reset() {
  db = new Loki();
  logs = db.addCollection('logs', { indices: ['_id'] });
  miniSearch = new MiniSearch({
    fields: ['message'],
    storeFields: ['_id'],
    idField: '_id',
  });
}

export async function insert(log) {
  logs.insert(log);
  miniSearch.add(log);
}

export function find(term) {
  const results = miniSearch.search(term);
  const ids = results.map(r => r._id);

  // LokiJS query real: usar índice de la colección
  return logs.find({ _id: { '$in': ids } });
}

export async function getAll() {
  return logs.find();
}
