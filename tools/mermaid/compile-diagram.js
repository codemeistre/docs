import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import prompts from 'prompts'
import { createDirname, createFilename } from './fs-utils.js'
import { createFullPathToMermaidDiagramsDir, changeFileExtTo } from './utils.js'
import { MERMAID_FILES_ROOT_DIRECTORY, MERMAID_CONFIG_FILE_PATH, MERMAID_FILES_EXT, BIN_PATH_MERMAID_CLI } from './constants.js'
import { execaSync as exec } from 'execa'

const __dirname = createDirname( createFilename() )

/**
 * @returns { Promise<{mermaidFilePath:string, shouldSave:boolean}> }
 */
export const promptCompileDiagram = () =>
  prompts([
    {
      type: 'text',
      name: 'mermaidFilePath',
      message: `Caminho para o arquivo que contém o código Mermaidjs a ser compilado (cwd: ${MERMAID_FILES_ROOT_DIRECTORY})`,
      initial: `${MERMAID_FILES_ROOT_DIRECTORY}/`,
      format: (ans) => {
        const fileExt = path.extname(ans)
        return createFullPathToMermaidDiagramsDir(__dirname, fileExt ? ans : `${ans}${MERMAID_FILES_EXT}`)
      },
      validate: ans => {
        if (!ans.trim()) return 'Campo obrigatório!'
        if (ans.startsWith('../') || ans.startsWith('./')) return 'Não use caminhos relativos!'
        const fileExt = path.extname(ans)
        if (fileExt && fileExt !== MERMAID_FILES_EXT) return `O arquivo deve ter a extensão "${MERMAID_FILES_EXT}"`

        ans = createFullPathToMermaidDiagramsDir(__dirname, fileExt ? ans : `${ans}${MERMAID_FILES_EXT}`)
        try {
          // Verificar se o arquivo tem permissão de escrita
          fs.accessSync(ans, fs.constants.R_OK)
        } catch (err) {
          if (err.code === 'ENOENT') return `"${ans}" não existe`
          if (err.code === 'EACCES') return `"${ans}" deve ter permissão de leitura para o usuário "${os.userInfo().username}"`
          throw err
        }

        const fileMetadata = fs.statSync(ans)
        if (!fileMetadata.isFile()) return 'Deve ser um arquivo!'

        return true
      },
    },
    {
      type: 'confirm',
      name: 'shouldSave',
      message: (prevAns) => `Salvar como arquivo "${path.basename(changeFileExtTo('.svg', prevAns))}" (e sobreescrever se já existir)?`,
      initial: 1,
    },
  ])

/**
 * @param {string} mermaidFilePath
 * @returns {void}
 */
export const compileDiagram = (mermaidFilePath) => {
  try {
    const outputFilePath = changeFileExtTo('.svg', mermaidFilePath)
    console.info('\n$ mmdc --configFile %s --input %s --output %s', MERMAID_FILES_ROOT_DIRECTORY, mermaidFilePath, outputFilePath)
    const { stdout } = exec(BIN_PATH_MERMAID_CLI, [
      '--configFile', MERMAID_CONFIG_FILE_PATH,
      '--input', mermaidFilePath,
      '--output', outputFilePath,
    ])
    console.info(stdout)
  } catch (err) {
    console.error(err.stderr || err)
    process.exitCode = err.errno || 1
  }
}

