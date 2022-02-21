#!/usr/bin/env bash
##
#% SYNOPSIS
#%    update-db-diagram
#% DESCRIPTION
#%    Script to download the Relational Model Diagram and update the 'docs'
#%    Git repository to push that new version. The downloaded file will be
#%    encrypted by https://www.npmjs.com/package/staticrypt using a secret.
#% NOTE
#%    Required programs: cURL, realpath, npx, Git
#% AUTHOR
#%    Micael Levi L. Cavalcante
#% COPYRIGHT
#%    Copyright © 2022 CodeMeistre.
##

set -euo pipefail
## Always using project's root directory as a working directory
cd "$(dirname "$0")"
cd ..


## Where the `.git` lives relative to this script file
PATH_REPOSITORY_DOCS="../docs" 

DATABASE_CURRENT_DIAGRAM_FILENAME="database.relational-model.html"
DATABASE_SPEC_DIAGRAM_FILENAME="database_spec.relational-model.html"

read -p ">> URL para o SVG/PlantUML editor: " url
[ -z "${url//[[:space:]]/}" ] && {
  echo "The URL is mandatory!"
  exit 1
}

echo
read -p ">> Senha para criptografar o arquivo anterior: " page_passphrase

echo
read -p ">> É o diagrama da especificação? [Yn] " -n 1 is_spec_diagram
is_spec_diagram=${is_spec_diagram,,}
is_spec_diagram=${is_spec_diagram:-y}
[[ "$is_spec_diagram" =~ ^[yn]$ ]] || exit 0 ## Abort

if [[ "$is_spec_diagram" = 'y' ]]; then
  ## The output temporary file that will be encrypted later
  tmp_diagram_file="./$(date +%s)-${DATABASE_SPEC_DIAGRAM_FILENAME}"

  page_title="(spec.) DB Relational Model $(date +'%x %R')"

  full_path_to_diagram_file="$(realpath ${PATH_REPOSITORY_DOCS}/${DATABASE_SPEC_DIAGRAM_FILENAME})"
else
  tmp_diagram_file="./$(date +%s).${DATABASE_CURRENT_DIAGRAM_FILENAME}"

  page_title="DB Relational Model $(date +'%x %R')"

  full_path_to_diagram_file="$(realpath ${PATH_REPOSITORY_DOCS}/${DATABASE_CURRENT_DIAGRAM_FILENAME})"
fi


## Download the diagram
curl "$url" --output "$tmp_diagram_file"

trap 'delete_svg' ERR
delete_svg() {
  rm --force "$tmp_diagram_file"
}

## Refreshs the repository
cd "$PATH_REPOSITORY_DOCS" && git pull && cd - 

## Encrypt the downloaded HTML/SVG file
npx staticrypt "$tmp_diagram_file" "$page_passphrase"  \
  --title "$page_title"                                \
  --output "$full_path_to_diagram_file"

delete_svg

## Update the `@codemeistre/docs` repository
cd "$PATH_REPOSITORY_DOCS"                   && \
git add "$full_path_to_diagram_file"         && \
git commit -m "docs: update $page_title"     && \
git push origin master

