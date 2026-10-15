# Reestruturação de navegação e arquitetura da informação

Data: 2026-08-05
Repos: `jurispro-front` (principal), `jurispro-back` (uma mudança aditiva)

## Problema

A aplicação cresceu para ~40 rotas e 224 componentes. A casca não acompanhou:
o menu virou uma lista de 12 itens que mistura trabalho com configuração de
conta, o header anuncia o nome errado da página, o painel empilha sete blocos
sem hierarquia e o hub de caso abre com dez abas. A lista de cálculos — o
produto central — filtra sobre a página corrente em vez do banco, então devolve
resultado errado.

Nenhum desses pontos veio de reclamação de usuário; veio da percepção do dono do
produto ao navegar. A auditoria abaixo é factual e cada item cita arquivo e
linha.

## Espinha dorsal do produto

**Cálculo é o produto.** O advogado entra, calcula, exporta, sai. Caso, cliente
e agenda existem para organizar cálculos, não o contrário. Toda decisão de IA
neste documento resolve a favor do cálculo quando há empate.

## Escopo

Reorganizar navegação e arquitetura da informação: sidebar, header, painel, abas
do hub de caso, e o filtro da lista de cálculos.

Fora de escopo:

- Refazer o wizard de cálculo (v2/v3, mode-chooser, steps). Fica como está.
- Remover feature. Nada de front nem de back é deletado, só movido ou agrupado.
- Renomear URLs. Decisão explícita: a mistura de idioma (`/cases` vs `/agenda`)
  fica. Só aparece na barra de endereço e não afeta o que o advogado clica;
  padronizar custaria ~40 referências de `navigate`/`Link`, mais a paleta de
  comandos e `TOUR_AREAS`, com risco de link e tour quebrados.

## Achados que este trabalho corrige

Navegação:

1. `src/components/header.tsx:6-18` — `ROUTE_TITLES` mapeia 5 de ~40 rotas.
   `/cases`, `/clients`, `/agenda`, `/equipe`, `/billing`, `/ajuda` e
   `/indicacoes` caem no fallback `"Painel"`. O header diz "Painel" em quase toda
   tela.
2. Título duplicado: o `<h1>` do header mais o `<h2>` de cada página. Duas
   hierarquias competindo, e a de cima está errada. `src/components/page-header.tsx`
   já existe, com breadcrumb e slot de ações, e não é usado nessas páginas.
3. `src/components/sidebar.tsx:52-83` — 12 itens navegáveis em dois grupos. O
   grupo "Gestão" mistura trabalho (Clientes, Templates) com conta (Perfil,
   Assinatura, Indicações, Configurações, Atalhos). O rótulo de grupo é 10px com
   opacidade 40%, ilegível como separador.
4. `src/components/sidebar.tsx:303-320` — o bloco "Em Breve" gasta três slots
   permanentes com botões `disabled` (Previdenciário, Cível, Tributário).
5. `src/components/sidebar.tsx:52-56` — Casos aparece antes de Cálculos, contra a
   espinha dorsal.
6. Nome do produto divergente na mesma tela: sidebar diz "Lex Laboral"
   (`sidebar.tsx:356`), header diz "Jurídico Pro · Trabalhista" (`header.tsx:48`).
7. `src/pages/protected/_layout.tsx` monta ao mesmo tempo `SubscriptionBanner`,
   `HelpLauncher` (FAB flutuante), `CommandPalette` e três tours automáticos.
   Somando `/ajuda`, `help-tip` e `info-banner`, são quatro sistemas de ajuda
   concorrentes.

Densidade:

8. `src/pages/protected/home/index.tsx` empilha sete blocos de peso visual
   idêntico: `GettingStarted`, `ActionInbox`, `FinanceSummary`, quatro
   `StatCard`, `UpcomingPanel`, `RecentList` e dois `DistributionBar`.
9. `src/pages/protected/home/components/getting-started.tsx:33-66` — a trilha é
   Perfil → Cliente → Caso → Cálculo. Quatro desvios antes de o produto
   funcionar.
10. `src/pages/protected/cases/hub/case-hub-layout.tsx:154-197` — dez abas com
    `flex-wrap`, quebrando em duas ou três linhas. A única ação no header do hub
    é **Excluir**, em `variant="destructive"` permanente; não existe Editar. A
    ação mais perigosa é a mais visível.
11. A aba de caso chamada "Agenda" (rota `/audiencias`) colide de nome com a
    `/agenda` global, e sua contagem soma audiências com prazos.

Correção funcional:

12. `src/pages/protected/calculations/index.tsx:38-51` — busca e os dois filtros
    rodam client-side sobre a página de 20 itens (`useCalcSearch(items)`),
    enquanto a paginação é cursor server-side. Buscar um cliente que está na
    página 3 devolve zero resultados. A causa raiz é o backend:
    `jurispro-back/src/http/controllers/labor-calculation/list-labor-calculations.ts:31-34`
    aceita só `limit`, `cursor` e `clientId`. `list-cases.ts:47-52` faz certo e
    serve de referência.
13. Mesmo arquivo, rodapé: `{filtered.length} resultados` é contagem da página e
    lê-se como total.

Ruído de página:

14. `src/pages/protected/calculations/new/index.tsx:88-104` — banner amarelo de
    alerta permanente para informação neutra (taxa de FGTS e salário mínimo
    padrão), em toda criação de cálculo.

## Decisões

- **Painel enxuto continua a tela de entrada** (`/home`). O cálculo ganha
  primazia por três meios que não exigem apagar uma tela: botão "Novo cálculo"
  fixo no header global, Cálculos como primeiro item do menu, e o painel abrindo
  pela fila de pendências.
- **URLs não mudam.** Redirects legados existentes (`/workflow`, `/templates`)
  continuam.
- **Nada é deletado do backend.** A única mudança lá é aditiva: três query
  params novos.
- **`HelpLauncher` é removido do front**, não o sistema de ajuda: o conteúdo dele
  (replay de tours e link para `/ajuda`) migra para o menu do avatar.

## Desenho

### Casca

**Sidebar — 12 itens navegáveis viram 7, sem grupos.**

```
[OrganizationSwitcher]

Painel        /home
Cálculos      /calculations
Casos         /cases
Agenda        /agenda
Clientes      /clients
Templates     /library/templates
──────────────
Equipe        /equipe        (condicional: canManageMembers)
```

Cálculos vem antes de Casos. Os componentes `SidebarGroup` e `Collapsible` saem:
sete itens não precisam de agrupamento colapsável. O bloco "Em Breve" é
removido. O badge de assinatura (dias de trial / "Assinar"), hoje pendurado no
item Assinatura em `sidebar.tsx:123-152`, migra para o menu do avatar, onde o
item Assinatura passa a viver.

Movidos para o menu do avatar: Perfil, Assinatura, Indicações, Configurações,
Atalhos.

Regras de papel preservadas exatamente como estão: Equipe exige
`canManageMembers`; Assinatura e Indicações exigem `isOwner`
(`sidebar.tsx:235-240`). A checagem só muda de lugar, não de conteúdo — e
continua servindo apenas para esconder UI, com a API como autoridade.

**Header — de faixa decorativa a barra de trabalho.**

```
[hamburger (mobile)]  [busca ⌘K]  ···  [Novo cálculo]  [tema]  [avatar ▾]
```

`ROUTE_TITLES` e `getPageTitle` são deletados, junto com o `<h1>`. O título da
tela passa a ser responsabilidade única do `PageHeader` da página. O texto
estático "Jurídico Pro · Trabalhista" sai; o produto se chama Lex Laboral em
todo lugar.

O disparador de busca no header abre a `CommandPalette` já existente — a paleta
ganha um caminho visível em vez de depender de o usuário conhecer `⌘K`.

**Menu do avatar** (novo componente, `src/components/user-menu.tsx`):

```
Nome do usuário
e-mail
──────────────
Perfil                 /profile
Assinatura             /billing        (isOwner, com badge de trial/assinar)
Indicações             /indicacoes     (isOwner)
Configurações          /settings
Atalhos de teclado     /settings/atalhos
──────────────
Central de Ajuda       /ajuda
Rever tour desta área  (ação, de HelpLauncher)
──────────────
Sair
```

O botão Sair sai do rodapé da sidebar (`sidebar.tsx:323-338`) e passa a viver
só aqui, com o mesmo `useSignOut` + `resetAnalytics()` + `queryClient.clear()`.

**Ajuda — quatro sistemas viram dois.** Ficam os tours (contextuais, primeira
visita) e `/ajuda` (referência). `HelpLauncher` é removido do `_layout`. No
mobile o drawer já tinha esse conteúdo em `MobileHelpGroup`; ele também sai, e os
dois tamanhos de tela passam a usar o mesmo caminho: menu do avatar. `help-tip` e
`info-banner` continuam — são componentes de página, não de casca.

**PageHeader em todas as páginas protegidas.** Cada página troca seu bloco de
título ad-hoc pelo `PageHeader`, passando `title`, `subtitle` e `actions`. Isso
elimina a duplicação de hierarquia e dá um lugar único para o breadcrumb, que
hoje não existe em tela nenhuma.

### Painel

Sete blocos viram três zonas, com peso visual decrescente:

1. **Agir agora** — `ActionInbox` e `UpcomingPanel` lado a lado. Pendência e
   agenda respondem à mesma pergunta ("o que é hoje") e devem ser lidas juntas.
2. **Trabalho recente** — `RecentList` de cálculos, com "Novo cálculo" como ação
   do estado vazio.
3. **Números** — os quatro `StatCard` e o `FinanceSummary` numa faixa
   subordinada.

Os dois `DistributionBar` (status dos processos, tipo de rescisão) saem do
painel. São dado de vitrine, não de trabalho, e hoje competem por atenção com a
fila de pendências. Os componentes permanecem no repo, sem uso, caso voltem como
aba secundária.

`GettingStarted` reordena para começar pelo produto:

```
1. Faça o primeiro cálculo      /calculations/new
2. Cadastre o primeiro cliente  /clients/new
3. Abra o primeiro caso         /cases/new
4. Complete o perfil            /profile
```

O backend já devolve os quatro flags em `GET /onboarding-status`, então a
reordenação é só de apresentação. A implementação deve confirmar que criar um
cálculo não exige cliente previamente cadastrado — o wizard tem
`client-info-section` além de `client-select-section`, o que sugere que aceita
cliente digitado na hora. Se exigir, cliente volta para a primeira posição.

### Hub de caso

Dez abas viram quatro:

| Aba | Conteúdo agrupado | Rota |
| --- | --- | --- |
| Caso | visão geral, partes, notas | `/cases/:caseId` |
| Números | cálculos, acordos, financeiro | `/cases/:caseId/numeros` |
| Prazos | audiências, prazos, tarefas | `/cases/:caseId/prazos` |
| Autos | documentos, andamentos | `/cases/:caseId/autos` |

Composição interna uniforme: toda aba que reúne mais de uma coisa usa sub-abas
selecionadas por `?tab=`, nunca seções empilhadas. A regra "conteúdo curto empilha"
foi descartada na revisão porque nenhum dos conteúdos é curto — `summary-tab.tsx`
tem 334 linhas, `notes-tab.tsx` 323 e `parties-page.tsx` 142; empilhar produziria
uma aba de scroll interminável. Duas camadas previsíveis (4 abas no topo, no
máximo 3 sub-abas dentro) batem dez abas planas quebrando em três linhas.

| Aba | Sub-abas (`?tab=`) |
| --- | --- |
| Caso | Visão geral (default), Partes, Notas |
| Números | Cálculos (default), Acordos, Financeiro |
| Prazos | Audiências e prazos (default), Tarefas |
| Autos | Documentos (default), Andamentos |

`canAccessFinance` passa a esconder a **sub-aba** Financeiro, não a aba inteira.
Nenhum papel perde ou ganha acesso: quem não tem `canAccessFinance` simplesmente
não vê a sub-aba, e a API continua devolvendo 403 de todo modo.

As nove rotas antigas viram `Navigate replace` para a aba nova, preservando a
sub-aba quando houver:

```
/cases/:id/calculos    → /cases/:id/numeros
/cases/:id/acordos     → /cases/:id/numeros?tab=acordos
/cases/:id/financeiro  → /cases/:id/numeros?tab=financeiro
/cases/:id/audiencias  → /cases/:id/prazos
/cases/:id/tarefas     → /cases/:id/prazos?tab=tarefas
/cases/:id/documentos  → /cases/:id/autos
/cases/:id/andamentos  → /cases/:id/autos?tab=andamentos
/cases/:id/partes      → /cases/:id
/cases/:id/notas       → /cases/:id
```

Header do hub: **Excluir** sai do topo e vai para um menu `⋯` ao lado do título,
mantendo o `AlertDialog` de confirmação intacto. O topo passa a ter a ação
primária que faz sentido no contexto: "Novo cálculo neste caso", navegando para
`/calculations/new` com o `state` de caso e cliente que a rota já aceita
(`calculations/new/index.tsx:19-24`).

A aba antes chamada "Agenda" agora se chama **Prazos**, encerrando a colisão de
nome com a `/agenda` global.

### Lista de cálculos

**Backend** — `jurispro-back/src/http/controllers/labor-calculation/list-labor-calculations.ts`
ganha três query params opcionais, espelhando `list-cases.ts:47-52`:

- `search` — `contains` em `clientName`, `mode: 'insensitive'`
- `terminationType` — igualdade
- `calculationVersion` — igualdade

Aplicados no `where` do Prisma, ao lado de `calculationVisibility(request.tenant)`,
que continua intocado. Mudança puramente aditiva: chamada sem os params se
comporta como hoje.

**Front** — `calculations/index.tsx` passa os três ao `useListLaborCalculation`,
com debounce de 300ms na busca. Não existe padrão de debounce no repo:
`use-case-filters.ts` dispara a query a cada tecla, então o hook novo
`use-debounced-value.ts` é criado aqui e a lista de casos pode adotá-lo depois.

O hook `use-calc-search.ts` deixa de ser usado nesta página. Perde-se a busca
difusa do Fuse.js (`keys: clientName, terminationType`, `threshold: 0.4`) em troca
de `contains` exato no banco. É o preço da correção: fuzzy sobre 20 registros de
uma página vale menos que substring sobre a base inteira, e é o mesmo comportamento
que `list-cases` já tem. O rodapé para de dizer
"N resultados" e passa a mostrar só a página, já que a contagem total não existe
na resposta.

Requer `yarn orval` no front depois da mudança de backend, para os params novos
aparecerem no cliente gerado.

### Ruído de página

O banner de valores padrão em `calculations/new/index.tsx:88-104` troca o
esquema `amber` (cor de alerta) pelo `info-banner` neutro já existente no repo.
Informação de configuração não é aviso.

## Riscos e mitigação

- **Âncoras de tour que este trabalho quebra.** `use-product-tour.ts` seleciona
  elementos por `data-tour`, e quatro âncoras somem:
  - `use-product-tour.ts:88` — `[data-tour="help-button"]` no desktop e
    `[data-tour="help-mobile"]` no mobile, último passo do tour de boas-vindas.
    Ambos morrem com o `HelpLauncher` e o `MobileHelpGroup`; devem apontar para o
    gatilho do menu do avatar, que passa a ser o único lugar de ajuda nos dois
    tamanhos de tela.
  - `use-product-tour.ts:181` e `:189` — `[data-tour="case-movements"]` e
    `[data-tour="case-finance"]` apontam para abas do hub que passam a ser
    sub-abas de Autos e Números. Devem apontar para as sub-abas novas.

  Sobrevivem sem mudança: `nav-clients`, `nav-cases`, `nav-calculations`,
  `nav-agenda`, `sidebar`, `case-subnav`, `templates-*`, `agenda-*`. Os
  `data-tour` desses itens devem manter os ids atuais.
- **`TOUR_AREAS[].route` compara com `location.pathname`** (`sidebar.tsx:192`,
  `help-launcher.tsx:45`). Como as URLs não mudam, a lógica de replay migra
  intacta para o menu do avatar.
- **`CommandPalette` referencia rotas e rótulos** (`command-palette.tsx:57-68`).
  Precisa refletir a nova ordem e continuar cobrindo os destinos que saíram da
  sidebar, senão eles ficam só atrás do avatar.
- **Cliente Orval regenerado** pode mudar assinaturas de tipo em outros lugares;
  rodar `yarn build` depois do `yarn orval`.
- **Paginação por cursor** usa `id: { lt: cursor }` com
  `orderBy: { createdAt: 'desc' }` (`list-labor-calculations.ts:49-53`). Funciona
  porque `cuid()` é aproximadamente ordenável por tempo. Não é tocado aqui, mas
  fica registrado: adicionar filtros não agrava, e qualquer troca de gerador de
  id no futuro quebra a ordenação.

## Verificação

O front não tem suíte de testes (documentado no seu `CLAUDE.md`). Verificação:

- `yarn build` no front (roda `orval` + `tsc` + build) sem erro novo. O
  `CLAUDE.md` do projeto registra que o `tsc` do front já tinha erros
  pré-existentes; o critério é não adicionar erro, não zerar.
- `yarn test` no back verde, com um teste novo em `list-labor-calculations`
  cobrindo os três params.
- Roteiro manual:
  - cada uma das nove rotas antigas de aba de caso redireciona para a aba nova
    correta, com a sub-aba certa selecionada;
  - os cinco destinos que saíram da sidebar são alcançáveis pelo menu do avatar;
  - o badge de trial/assinar aparece no avatar quando aplicável;
  - buscar na lista de cálculos por um cliente que está fora da primeira página
    encontra o registro;
  - papel sem `canAccessFinance` não vê a sub-aba Financeiro e vê o resto de
    Números;
  - papel sem `canManageMembers` não vê Equipe;
  - o tour de boas-vindas roda do primeiro ao último passo sem sumir, e os tours
    de caso encontram as sub-abas de Andamentos e Financeiro;
  - tema claro e escuro em cada tela tocada;
  - largura mobile: drawer abre, menu do avatar é alcançável, abas do hub não
    quebram em três linhas.

## Ordem de implementação

1. Backend: três params em `list-labor-calculations` + teste.
2. Front: `yarn orval`, então corrigir `calculations/index.tsx`.
3. `user-menu.tsx` novo, com os cinco itens migrados, ajuda e Sair.
4. `header.tsx` reescrito; `ROUTE_TITLES` deletado.
5. `sidebar.tsx` enxugado; `HelpLauncher` e `MobileHelpGroup` removidos.
6. `use-product-tour.ts` e `command-palette.tsx` reconciliados com a nova casca.
7. `PageHeader` adotado nas páginas protegidas.
8. Painel reorganizado; `GettingStarted` reordenado.
9. Hub de caso reagrupado, com os redirects.
10. Banner do wizard neutralizado.

Cada passo é verificável isoladamente. Os passos 1-2 entregam a correção
funcional e podem ir sozinhos se o resto atrasar.
