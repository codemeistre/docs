import path from 'node:path'
import url from 'node:url'

/**
 * Creates the `__filename`.
 * @returns {string}
 */
export const createFilename = () => url.fileURLToPath(import.meta.url)

/**
 * Creates the `__dirname`.
 * @param {string} filename
 * @returns {string}
 */
export const createDirname = (filename) => path.dirname(filename)

/**
 * @param {string} filePath
 * @returns {boolean}
 */
export const hasExtension = (filePath) => !!path.extname(filePath)

/**
 * @param {string} filePath
 * @returns {string}
 */
export const resolveParentDirname = (filePath) =>
  path.basename(path.dirname(filePath))

/**
 * @param {string} filePath
 * @returns {string}
 */
export const stripFileExtension = (filePath) => {
  const ext = path.extname(filePath)
  return !!ext ? filePath.slice(0, - ext.length) : filePath
}

