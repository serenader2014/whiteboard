const str = 'string'
// const num = 'number'
const int = 'integer'
const text = 'text'
// const float = 'float'
const increments = 'increments'
// const date = 'date'
const dateTime = 'dateTime'
// const time = 'time'
// const timestamp = 'timestamp'

export default {
  users: {
    id: { type: increments, nullable: false, primary: true },
    username: { type: str, maxlength: 150, nullable: false },
    slug: { type: str, maxlength: 150, nullable: false, unique: true },
    password: { type: str, maxlength: 60, nullable: false },
    email: { type: str, maxlength: 254, nullable: false, unique: true },
    image: { type: text, maxlength: 2000, nullable: true },
    cover: { type: text, maxlength: 2000, nullable: true },
    bio: { type: str, maxlength: 200, nullable: true },
    website: { type: text, maxlength: 2000, nullable: true, validations: { isEmptyOrURL: true } },
    location: { type: text, maxlength: 65535, nullable: true },
    status: { type: str, maxlength: 150, nullable: false, defaultTo: 'active' },
    language: { type: str, maxlength: 6, nullable: false, defaultTo: 'en_US' },
    tour: { type: text, maxlength: 65535, nullable: true },
    last_login: { type: dateTime, nullable: true },
    created_at: { type: dateTime, nullable: false },
    created_by: { type: int, nullable: false },
    updated_at: { type: dateTime, nullable: true },
    updated_by: { type: int, nullable: true }
  },
  roles: {
    id: { type: increments, nullable: false, primary: true },
    name: { type: str, maxlength: 50, nullable: false, unique: true },
    description: { type: str, maxlength: 200, nullable: true },
    created_at: { type: dateTime, nullable: false },
    created_by: { type: int, nullable: false },
    updated_at: { type: dateTime, nullable: true },
    updated_by: { type: int, nullable: true }
  },
  roles_users: {
    id: { type: increments, nullable: false, primary: true },
    role_id: { type: int, nullable: false },
    user_id: { type: int, nullable: false }
  },
  permissions: {
    id: { type: increments, nullable: false, primary: true },
    name: { type: str, maxlength: 150, nullable: false, unique: true },
    object_type: { type: str, maxlength: 150, nullable: false },
    action_type: { type: str, maxlength: 150, nullable: false },
    condition: { type: str, maxlength: 150, nullable: true },
    created_at: { type: dateTime, nullable: false },
    created_by: { type: int, nullable: false },
    updated_at: { type: dateTime, nullable: true },
    updated_by: { type: int, nullable: true }
  },
  permissions_roles: {
    id: { type: increments, nullable: false, primary: true },
    role_id: { type: int, nullable: false },
    permission_id: { type: int, nullable: false }
  },
  settings: {
    id: { type: increments, nullable: false, primary: true },
    key: { type: str, maxlength: 150, nullable: false, unique: true },
    value: { type: text, maxlength: 65535, nullable: true },
    type: { type: str, maxlength: 150, nullable: false, defaultTo: 'core' },
    created_at: { type: dateTime, nullable: false },
    created_by: { type: int, nullable: false },
    updated_at: { type: dateTime, nullable: true },
    updated_by: { type: int, nullable: true }
  },
  categories: {
    id: { type: increments, nullable: false, primary: true },
    name: { type: str, maxlength: 150, nullable: false, unique: true },
    slug: { type: str, maxlength: 150, nullable: false, unique: true },
    created_at: { type: dateTime, nullable: false },
    created_by: { type: int, nullable: false },
    updated_at: { type: dateTime, nullable: true },
    updated_by: { type: int, nullable: true }
  }
}
