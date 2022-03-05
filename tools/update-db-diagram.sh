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

## Where the private diagrams lives in
PATH_PRIVATE_DIAGRAMS="private-diagrams"
## The name of the SVG file for the database spec. diagram
## Notice the unique number at the end that ensures other users won't find it
SPEC_DIAGRAM_FILENAME="database_spec.relational-model__e137076d1747__.svg"
## The name of the SVG file for the current database schema diagram
CURRENT_DIAGRAM_FILENAME="database.relational-model__8c16468cc752__.svg"

DATABASE_SPEC_DIAGRAM_FILENAMENAME="database_spec.relational-model.html"
DATABASE_CURRENT_DIAGRAM_FILENAMENAME="database.relational-model.html"

read -p ">> URL para o arquivo SVG ou para a página do editor (do PlantUML): " url
[ -z "${url//[[:space:]]/}" ] && {
  echo "The URL cannot be empty!"
  exit 1
}
## NOTE: The following two replaces are assuming that the format of `url` variable
##       will have a "/uml/" to indicates that it is an URL to the PlantUML editor,
##       or it will have a "/svg/" to indicates that it is an URL to the SVG file
diagram_svg_url="${url/"/uml/"/"/svg/"}"
diagram_editor_url="${url/"/svg/"/"/uml/"}"

echo; read -p ">> Senha para criptografar o arquivo anterior: " page_passphrase

echo; read -p ">> É o diagrama da especificação? [Yn]: " -n 1 is_spec_diagram
is_spec_diagram=${is_spec_diagram:-y} ; is_spec_diagram=${is_spec_diagram,,}
## Abort if neither 'y' nor 'n' (insensitive casse) was supplied
[[ "$is_spec_diagram" =~ ^[yn]$ ]] || exit 0

if [[ "$is_spec_diagram" = 'y' ]]; then
  page_title="(spec.) DB Relational Model $(date +'%x %R')"
  full_path_to_diagram_file="$(realpath ${PATH_REPOSITORY_DOCS}/${PATH_PRIVATE_DIAGRAMS}/${DATABASE_SPEC_DIAGRAM_FILENAMENAME})"
  diagram_img_path="${SPEC_DIAGRAM_FILENAME}"
else
  page_title="DB Relational Model $(date +'%x %R')"
  full_path_to_diagram_file="$(realpath ${PATH_REPOSITORY_DOCS}/${PATH_PRIVATE_DIAGRAMS}/${DATABASE_CURRENT_DIAGRAM_FILENAMENAME})"
  diagram_img_path="${CURRENT_DIAGRAM_FILENAME}"
fi

svg_tmp_file="$(date +'%s').svg"
html_tmp_file="$(date +'%s').html"
trap 'cleanup' EXIT
cleanup() {
  rm --force "$svg_tmp_file" "$html_tmp_file"
}

## Download the diagram as a SVG temporary file that will be embedded into the HTML
curl "$diagram_svg_url" --output "$svg_tmp_file"

cat <<EOF > $html_tmp_file
<!DOCTYPE html>
<html>
  <body>
    <div>
      <a href="${diagram_editor_url}" style="opacity: 20%;">EDIT</a>
    </div>
   $(cat $svg_tmp_file)
  </body>
</html>
EOF


## Refreshs the Git repository
cd "$PATH_REPOSITORY_DOCS" && git pull && cd -

## Encrypt the downloaded HTML/SVG file
npx staticrypt "$html_tmp_file" "$page_passphrase"  \
  --embed                                           \
  --title "$page_title"                             \
  --output "$full_path_to_diagram_file"


## Update the `@codemeistre/docs` repository
cd "$PATH_REPOSITORY_DOCS"                   && \
git add "$full_path_to_diagram_file"         && \
git commit -m "docs: update $page_title"     && \
git push origin master
