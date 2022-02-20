import path from 'node:path'
import { MERMAID_FILES_ROOT_DIRECTORY } from './constants.js'
import { resolveParentDirname } from './fs-utils.js'

/**
 * @param {string} parentDirPath
 * @param {string} filePath
 * @returns {string}
 */
export const createFullPathToMermaidDiagramsDir = (parentDirPath, filePath) =>
  path.join(parentDirPath, '..', '..', path.join(MERMAID_FILES_ROOT_DIRECTORY, filePath))

/**
 * @param {string} filePath
 * @returns {boolean}
 */
export const isNestedUnderMermaidDiagramsRootDir = (filePath) =>
  resolveParentDirname(filePath) === MERMAID_FILES_ROOT_DIRECTORY
