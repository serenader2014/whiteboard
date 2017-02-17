import path from 'path'

const baseDir = path.resolve(__dirname, '../..')
const absolutePathReg = new RegExp(`^${baseDir}`)

async function createFolderIfNotExist (dir) {
  const absoluteDir = path.join(baseDir, dir)
  try {
    await fs.mkdirAsync(absoluteDir)
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }
}

// dir is a relative/absolute path
export default function (dir) {
  const relativePath = dir.replace(absolutePathReg, '')
  const segment = relativePath.split(path.sep)

  const nestedDirList = segment.reduce((arr, dir) => {
    const lastDir = arr[arr.length - 1] || ''
    arr.push(path.join(lastDir, dir))
    return arr
  }, [])

  return nestedDirList.reduce((promise, item) => {
    return promise.then(() => createFolderIfNotExist(item))
  }, Promise.resolve())
}
