import bookshelf from '../db/bookshelf'

export default class Permission extends bookshelf.Model {
    get tableName() {
        return 'permissions';
    }
}
