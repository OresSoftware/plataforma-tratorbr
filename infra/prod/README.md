# Infraestrutura versionada de producao

Esta pasta passa a ser a referencia versionada das configuracoes de runtime de `prod` que antes ficavam apenas fora do repositorio da aplicacao.

Arquivos cobertos agora:

- `infra/prod/docker-compose.yml`
- `infra/prod/conf.d/default.conf`

Objetivo:

- reduzir divergencia entre `DEV` e `PROD`
- permitir revisar alteracoes de infraestrutura no mesmo fluxo de Git
- evitar ajustes manuais inesperados no servidor de producao

Fluxo recomendado:

1. alterar o codigo no checkout de `DEV`
2. se houver mudanca de infraestrutura de `prod`, atualizar tambem esta pasta
3. commitar e dar `push`
4. no servidor de `PROD`, sincronizar o checkout da aplicacao
5. comparar/copiar os arquivos versionados para o runtime de `prod` apenas quando houver mudanca real de infraestrutura
6. rebuildar/reiniciar somente o servico necessario

Observacao importante:

- estes arquivos nao substituem automaticamente o runtime atual de `prod`
- eles existem para manter uma fonte de verdade versionada
- o runtime atual de `prod` continua usando:
  - `/home/tratorbr/landingpage/docker-compose.yml`
  - `/home/tratorbr/landingpage/conf.d-user/default.conf`

Quando houver mudanca estrutural futura, a regra passa a ser:

- alterar primeiro os arquivos desta pasta
- revisar no Git
- depois aplicar no ambiente
