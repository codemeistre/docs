## Diagramas Mermaid

Códigos de diagramas que modelam comportamentos da plataforma.  
Podem ser usados em [Mermaid Live Editor](https://mermaid-js.github.io/mermaid-live-editor) para visualização/edição.

### Organização

Os arquivos com sufixo `.mmd` neste diretório, devem:

- modelar um comportamento ou caso de uso da plataforma
- uma das primeiras linhas deve indicar a versão da especificação (dd-mm-yyyy), ex: `#! spec: 01-02-2021`
- se for referente à API: uma das primeiras linhas deve indicar a versão da API ex: `#! api: v0.0.0`
- o nome do arquivo deve estar em `snake_case.mmd`, em inglês, ser bem descritivo, e não depender da ordenação do sistema de arquivos
- estar localizados num diretório que deve ter o mesmo nome que o módulo (ou 'categoria' da documentação OpenAPI) 

---

#### Auth

- [login when user is deactivated](./auth/login_when_user_is_deactivated.svg)
- [lock current session](./auth/lock_session.svg)
- [unlock current session](./auth/unlock_session.svg)

#### Work

- [staff create new work](./work/staff_create_work.svg)
