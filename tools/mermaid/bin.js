#!/usr/bin/env node

import path from 'node:path'
import fs from 'node:fs'
import url from 'node:url'
import os from 'node:os'
import prompts from 'prompts'
import { execaSync as exec } from 'execa'
import { snakeCase } from 'snake-case'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const MERMAID_FILES_EXT = '.mmd'
const MERMAID_FILES_ROOT_DIRECTORY = 'mermaid-diagrams'
const MERMAID_CONFIG_FILE_PATH = path.join(__dirname, '..', '..', MERMAID_FILES_ROOT_DIRECTORY, 'mermaid.config.json')
const BIN_PATH_MERMAID_CLI = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'mmdc')


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

/**
 * @param {string} newExt
 * @param {string} filePath
 * @returns {string}
 */
export const changeFileExtTo = (newExt, filePath) =>
  `${stripFileExtension(filePath)}${newExt}`

/**
 * @param {string} filePath
 * @returns {string}
 */
export const createFullPathToMermaidDiagramsDir = (filePath) =>
  path.join(__dirname, '..', '..', path.join(MERMAID_FILES_ROOT_DIRECTORY, filePath))


/**
 * @returns { Promise<{newMermaidFilePath:string, specVersion:string, shouldCreate:boolean}> }
 */
const promptNewDiagram = () =>
  prompts([
    {
      type: 'text',
      name: 'newMermaidFilePath',
      message: `Caminho para que contém o código Mermaidjs a ser compilado (cwd: ${MERMAID_FILES_ROOT_DIRECTORY})`,
      initial: `${MERMAID_FILES_ROOT_DIRECTORY}/`,
      format: (ans) => {
        ans = snakeCase(ans)
        const fileExt = path.extname(ans)
        return createFullPathToMermaidDiagramsDir(fileExt ? ans : `${ans}${MERMAID_FILES_EXT}`)
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
 * @param {string} specDocVersion
 */
const generateDiagramBoilerplate = (filePath, specDocVersion) => {
  const initialCode = [
    `%%! spec: ${new Intl.DateTimeFormat('pt-BR').format(specDocVersion)}`,
    '',
    '',
  ].join('\n')

  if ( resolveParentDirname(filePath) !== MERMAID_FILES_ROOT_DIRECTORY )
    fs.mkdirSync(path.dirname(filePath), { recursive: true })

  fs.writeFileSync(filePath, initialCode)
  console.info(`Arquivo criado: "${filePath}"`)
}


/**
 * @returns { Promise<{mermaidFilePath:string, shouldSave:boolean}> }
 */
const promptCompileDiagram = () =>
  prompts([
    {
      type: 'text',
      name: 'mermaidFilePath',
      message: `Caminho para o arquivo que contém o código Mermaidjs a ser compilado (cwd: ${MERMAID_FILES_ROOT_DIRECTORY})`,
      initial: `${MERMAID_FILES_ROOT_DIRECTORY}/`,
      format: (ans) => {
        const fileExt = path.extname(ans)
        return createFullPathToMermaidDiagramsDir(fileExt ? ans : `${ans}${MERMAID_FILES_EXT}`)
      },
      validate: ans => {
        if (!ans.trim()) return 'Campo obrigatório!'
        if (ans.startsWith('../') || ans.startsWith('./')) return 'Não use caminhos relativos!'
        const fileExt = path.extname(ans)
        if (fileExt && fileExt !== MERMAID_FILES_EXT) return `O arquivo deve ter a extensão "${MERMAID_FILES_EXT}"`

        ans = createFullPathToMermaidDiagramsDir(fileExt ? ans : `${ans}${MERMAID_FILES_EXT}`)
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
const compileDiagram = (mermaidFilePath) => {
  try {
    const outputFilePath = changeFileExtTo('.svg', mermaidFilePath)
    console.info(`\n$ mmdc --configFile ${MERMAID_FILES_ROOT_DIRECTORY} --input ${mermaidFilePath} --output ${outputFilePath}`)
    const { stdout } = exec(BIN_PATH_MERMAID_CLI, [
      '--configFile', MERMAID_CONFIG_FILE_PATH,
      '--input', mermaidFilePath,
      '--output', outputFilePath,
    ])
    console.info(stdout)
  } catch (err) {
    console.error(err.stderr)
    process.exitCode = err.errno || 1
  }
}



// ========================================================================== //

const { action } = await prompts([
  {
    type: 'select',
    name: 'action',
    message: 'O que deseja fazer?',
    initial: 1,
    choices: [
      { title: 'Gerar um boilerplate para um diagrama Mermaid', value: 'new_diagram' },
      { title: 'Compilar um diagrama Mermaid existente', value: 'compile_diagram' },
    ],
  }
])

switch (action) {
  case 'new_diagram': {
    const { newMermaidFilePath, specVersion, shouldCreate } = await promptNewDiagram()
    if (!newMermaidFilePath || !shouldCreate) process.exit()
    generateDiagramBoilerplate(newMermaidFilePath, specVersion)
    break
  }
  case 'compile_diagram': {
    const { mermaidFilePath, shouldSave } = await promptCompileDiagram()
    if (!mermaidFilePath || !shouldSave) process.exit()
    compileDiagram(mermaidFilePath)
    break
  }
}

