import path from 'node:path'
import fs from 'node:fs'
import prompts from 'prompts'
import { createDirname, createFilename, resolveParentDirname, changeFileExtTo } from './fs-utils.js'
import { createFullPathToMermaidDiagramsDir } from './helpers.js'
import { MERMAID_FILES_ROOT_DIRECTORY, MERMAID_FILES_EXT } from './constants.js'
import { snakeCase } from 'snake-case'

const __dirname = createDirname( createFilename() )

/**
 * @returns { Promise<{newMermaidFilePath:string, specVersion:Date, shouldCreate:boolean}> }
 */
export const promptNewDiagram = () =>
  prompts([
    {
      type: 'text',
      name: 'newMermaidFilePath',
      message: `Caminho para que contém o código Mermaidjs a ser compilado (cwd: ${MERMAID_FILES_ROOT_DIRECTORY})`,
      initial: `${MERMAID_FILES_ROOT_DIRECTORY}/`,
      format: (ans) => {
        ans = snakeCase(ans)
        const fileExt = path.extname(ans)
        return createFullPathToMermaidDiagramsDir(__dirname, fileExt ? ans : `${ans}${MERMAID_FILES_EXT}`)
      },
      validate: ans => {
        if (!ans.trim()) return 'Campo obrigatório!'
        if (ans.startsWith('../') || ans.startsWith('./')) return 'Não use caminhos relativos!'
        const fileExt = path.extname(ans)
        if (fileExt && fileExt !== MERMAID_FILES_EXT) return `O arquivo deve ter a extensão "${MERMAID_FILES_EXT}"`

        return true
      },
    },
    {
      type: 'confirm',
      name: 'shouldCreate',
      message: (prevAns) => `Criar arquivo "${path.basename(changeFileExtTo(MERMAID_FILES_EXT, prevAns))}" (e sobreescrever se já existir)?`,
      initial: 1,
    },
    {
      type: 'date',
      name: 'specVersion',
      message: 'Qual versão da especificação o diagrama seguirá?',
      mask: 'DD-MM-YYYY',
    },
  ])

/**
 * @param {string} filePath
 * @param {Date} specDocVersion
 */
export const generateDiagramBoilerplate = (filePath, specDocVersion) => {
  const initialCode = [
    `%%! spec: ${new Intl.DateTimeFormat('pt-BR').format(specDocVersion)}`,
    '',
    '',
  ].join('\n')

  if ( resolveParentDirname(filePath) !== MERMAID_FILES_ROOT_DIRECTORY )
    fs.mkdirSync(path.dirname(filePath), { recursive: true })

  fs.writeFileSync(filePath, initialCode)
  console.info('Arquivo criado: %s', filePath)
}

