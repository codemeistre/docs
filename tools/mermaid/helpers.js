import path from 'node:path'
import { MERMAID_FILES_ROOT_DIRECTORY } from './constants.js'

/**
 * @param {string} parentDirPath
 * @param {string} filePath
 * @returns {string}
 */
export const createFullPathToMermaidDiagramsDir = (parentDirPath, filePath) =>
  path.join(parentDirPath, '..', '..', path.join(MERMAID_FILES_ROOT_DIRECTORY, filePath))
