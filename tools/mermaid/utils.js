import path from 'node:path'
import { stripFileExtension } from './fs-utils.js'
import { MERMAID_FILES_ROOT_DIRECTORY } from './constants.js'

/**
 * @param {string} newExt
 * @param {string} filePath
 * @returns {string}
 */
export const changeFileExtTo = (newExt, filePath) =>
  `${stripFileExtension(filePath)}${newExt}`

/**
 * @param {string} parentDirPath
 * @param {string} filePath
 * @returns {string}
 */
export const createFullPathToMermaidDiagramsDir = (parentDirPath, filePath) =>
  path.join(parentDirPath, '..', '..', path.join(MERMAID_FILES_ROOT_DIRECTORY, filePath))
