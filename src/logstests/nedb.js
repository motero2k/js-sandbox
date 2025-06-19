import Datastore from 'nedb';
import MiniSearch from 'minisearch';

let db, miniSearch;

export function reset() {
  db = new Datastore();
  miniSearch = new MiniSearch({
    fields: ['message'],
    storeFields: ['_id'],  // solo indexamos y devolvemos _id
    idField: '_id',
  });
}

export async function insert(log) {
  return new Promise((resolve, reject) => {
    db.insert(log, (err, newDoc) => {
      if (err) return reject(err);
      miniSearch.add(newDoc);
      resolve();
    });
  });
}

export function find(term) {
  const results = miniSearch.search(term);
  const ids = results.map(r => r._id);

  // Buscar todos los documentos completos por _id
  return new Promise((resolve, reject) => {
    db.find({ _id: { $in: ids } }, (err, docs) => {
      if (err) return reject(err);
      resolve(docs);
    });
  });
}

export async function getAll() {
  return new Promise((resolve) => {
    db.find({}, (err, docs) => resolve(docs));
  });
}
