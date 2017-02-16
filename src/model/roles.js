import bookshelf from '../db/bookshelf'

import Permission from './permissions'

export default class Role extends bookshelf.Model {
    get tableName() {
        return 'roles';
    }

    permissions() {
        return this.belongsTo(Permission, 'permission_id')
    }
}
