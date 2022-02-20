## Diagramas Mermaid

Códigos de diagramas que modelam comportamentos da plataforma.  
Podem ser usados em [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor) para visualização/edição.

### Organização

Os arquivos com sufixo `.mmd` neste diretório, devem:

- modelar um comportamento ou caso de uso da plataforma
- uma das primeiras linhas deve indicar a versão da especificação (dd/mm/yyyy), ex: `%%! spec: 01/02/2021`
- o nome do arquivo deve estar em `snake_case.mmd`, em inglês, ser bem descritivo, e não depender da ordenação do sistema de arquivos
- estar localizados num diretório que deve ter o mesmo nome que o módulo (ou 'categoria' da documentação OpenAPI) 

Use o utilitário `./tools/mermaid/bin.js` para seguir as convenções acima, na raiz do projeto: `$ yarn mermaid`
