import path from 'path'

const baseDir = path.resolve(__dirname, '../..')
const absolutePathReg = new RegExp(`^${baseDir}`)

async function createFolderIfNotExist(dir) {
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
export default async function(dir) {
  const relativePath = dir.replace(absolutePathReg, '')
  const segment = relativePath.split(path.sep)

  const nestedDirList = segment.reduce((arr, dir) => {
    const lastDir = arr[arr.length - 1] || ''
    arr.push(path.join(lastDir, dir))
    return arr
  }, [])

  for (let i of nestedDirList) {
    await createFolderIfNotExist(i)
  }
}
