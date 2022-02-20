#!/usr/bin/env node

import prompts from 'prompts'
import { promptCompileDiagram, compileDiagram } from './compile-diagram.js'
import { promptNewDiagram, generateDiagramBoilerplate } from './generate-boilerplate.js'
import { MERMAID_EDITOR_URL } from './constants.js'

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
    console.info('Vá para o editor %s', MERMAID_EDITOR_URL)
    break
  }
  case 'compile_diagram': {
    const { mermaidFilePath, shouldSave } = await promptCompileDiagram()
    if (!mermaidFilePath || !shouldSave) process.exit()
    compileDiagram(mermaidFilePath)
    break
  }
}

