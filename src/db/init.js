import createTable from './create-table';
import schemas from './schemas';

const modelList = ['user'];

export default () => modelList.reduce((promise, model) => promise.then(() => {
  /* eslint-disable global-require */
  const Model = require(`../model/${model}`).default;
  return Model.forge().fetchAll().catch(() => {
    return createTable(model, schemas[model]);
  });
}), Promise.resolve());
