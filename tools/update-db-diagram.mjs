#!/usr/bin/env -S npx zx
// ##
// #% SYNOPSIS
// #%    update-db-diagram.mjs
// #% DESCRIPTION
// #%    Script to download the Relational Model Diagram and update the 'docs'
// #%    Git repository to push that new version. The downloaded file will be
// #%    encrypted by https://www.npmjs.com/package/staticrypt using a secret.
// #% NOTE
// #%    Required programs: npx, Git
// #%    This code uses the https://github.com/google/zx utility.
// #% AUTHOR
// #%    Micael Levi L. Cavalcante
// #% COPYRIGHT
// #%    Copyright © 2022 CodeMeistre.
// ##
$.shell = '/usr/bin/bash'
$.verbose = process.env.NODE_ENV === 'development'

import path from 'node:path'
import { pipeline } from 'node:stream/promises'

/** Path to where the `.git` lives relative to this script file. */
const PATH_REPOSITORY_DOCS=path.join(__dirname, '..')
const REPOSITORY_REMOTE_NAME = 'origin'
const REPOSITORY_TARGET_BRANCH = 'master'
/** Path to where the private diagrams lives relative to this script file. */
const PATH_PRIVATE_DIAGRAMS=path.join(__dirname, '..', 'private-diagrams')
const DATABASE_SPEC_DIAGRAM_FILENAMENAME='database_spec.relational-model.html'
const DATABASE_CURRENT_DIAGRAM_FILENAMENAME='database.relational-model.html'


const url = await question(
  chalk.bold.bgBlack('→ URL para o arquivo SVG ou para a página do editor (do PlantUML): ')
).then(answer => answer.trim())
if (!url) {
  console.error( chalk.bold.red('A URL não pode ser vazia!') )
  process.exit(1)
}
// NOTE: The following two replaces are assuming that the format of `url` variable
//       will have a "/uml/" to indicates that it is an URL to the PlantUML editor,
//       or it will have a "/svg/" to indicates that it is an URL to the SVG file.
const diagram_svg_url = url.replace('/uml/', '/svg/')
const diagram_editor_url = url.replace('/svg/', '/uml/')

const page_passphrase = await question(
  chalk.bold.bgBlack('→ Senha para criptografar o arquivo anterior: ')
)

const is_spec_diagram = await question(
  chalk.bold.bgBlack(`→ É o diagrama da especificação? ${chalk.dim('[Yn]')}: `),
)
  .then((answer) => {
    // Abort if neither 'y' nor 'n' (insensitive casse) was supplied
    answer = (answer || 'y').trim().at(0).toLowerCase()
    if (!['y', 'n'].includes(answer)) process.exit()
    return answer === 'y'
  })

let page_title, full_path_to_diagram_file;
const currTime = new Intl.DateTimeFormat('pt-BR', {
  hour12:false, timeZone:'America/Manaus',
  year:'numeric', month:'numeric', day:'numeric',
  hour:'numeric', minute:'numeric'
}).format(new Date())
if (is_spec_diagram) {
  page_title = `(spec.) DB Relational Model ${currTime}`
  full_path_to_diagram_file = path.join(PATH_PRIVATE_DIAGRAMS, DATABASE_SPEC_DIAGRAM_FILENAMENAME)
} else {
  page_title = `DB Relational Model ${currTime}`
  full_path_to_diagram_file = path.join(PATH_PRIVATE_DIAGRAMS, DATABASE_CURRENT_DIAGRAM_FILENAMENAME)
}

const svg_tmp_file = `${Date.now()}.svg`
const html_tmp_file = `${Date.now()}.html`
async function cleanup() {
  if (cleanup.done) return;
  await Promise.allSettled([
    fs.rm(svg_tmp_file, { force: true }),
    fs.rm(html_tmp_file, { force: true }),
  ])
  cleanup.done = true
}
process.once('SIGINT', cleanup)
process.once('beforeExit', cleanup)
process.once('uncaughtException', cleanup)

// Download the diagram as a SVG temporary file that will be embedded into the HTML
console.log(chalk.black.bgYellow('Baixando SVG...'))
try {
  const resp = await fetch(diagram_svg_url)
  if (!resp.ok) throw new Error('Something went wrong while downloading the SVG file')
  await pipeline(resp.body, fs.createWriteStream(svg_tmp_file))
} catch (err) {
  if (err.errno === 'ENOTFOUND') console.error( chalk.bold.black('A URL informada não foi resolvida!') )
  else if (err.code === 'ERR_INVALID_URL') console.error( chalk.bold.red(`A URL está inválida: "${err.input}"`) )
  else console.error( chalk.bold.red(err.message || err) )
  process.exit()
}
console.log(chalk.black.bgGreen('Feito!'))

// Refreshs the Git repository
await cd(PATH_REPOSITORY_DOCS)
$.verbose = true
await $`git pull`
$.verbose = false

// Create the temporary HTML file that will be encrypted later
fs.writeFileSync(html_tmp_file, `
<!DOCTYPE html>
<html>
  <body>
    <div>
      <a href="${diagram_editor_url}" style="opacity: 20%;">EDIT</a>
    </div>
   ${ fs.readFileSync(svg_tmp_file, { encoding: 'utf8' }) }
  </body>
`)

// Encrypt the downloaded HTML/SVG file
console.log(chalk.black.bgYellow('Gerando HTML criptografado...'))
await $`npx staticrypt ${html_tmp_file} ${page_passphrase} --embed --title ${page_title} --output ${full_path_to_diagram_file}`
console.log(chalk.black.bgGreen('Feito!'))

// Commit and pushes the changes to remote
await cd(PATH_REPOSITORY_DOCS)
await $`git add ${full_path_to_diagram_file}`
await $`git commit ${['-m', 'docs: update ' + page_title]}`
await $`git push ${REPOSITORY_REMOTE_NAME} ${REPOSITORY_TARGET_BRANCH}`