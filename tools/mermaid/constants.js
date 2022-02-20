import path from 'node:path'
import { createDirname, createFilename } from './fs-utils.js'

const __dirname = createDirname( createFilename() )

export const MERMAID_FILES_EXT = '.mmd'
export const MERMAID_FILES_ROOT_DIRECTORY = 'mermaid-diagrams'
export const MERMAID_CONFIG_FILE_PATH = path.join(__dirname, '..', '..', MERMAID_FILES_ROOT_DIRECTORY, 'mermaid.config.json')
export const BIN_PATH_MERMAID_CLI = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'mmdc')
export const MERMAID_EDITOR_URL = new URL('https://mermaid-js.github.io/mermaid-live-editor')
