# ARES Performance Hub — Remastered

Projeto do **AresZ** para organizar perfis de jogos, ferramentas de sensibilidade, otimizadores de sessão, rede, mouse e teclado em uma experiência única para Windows.

## Estrutura atual

```text
index.html                 # Home / Performance Hub Remastered
bats.html                  # BAT Center com busca
admin.html                 # Painel administrativo com login local
404.html                   # Página de erro personalizada
robots.txt                 # Regras de indexação
sitemap.xml                # Sitemap público
assets/
  ares-mark.svg            # Marca vetorial
  styles.css               # Design system principal
  premium.css              # Camada visual/interativa Remastered
  premium.js               # Busca global, favoritos, recentes, deep links
  site-data.js             # Dados centralizados do site
  app.js                   # Engine da Home
  bats.js                  # Engine do BAT Center
  admin.css                # Layout do Admin
  admin.js                 # Engine do Admin
  admin-auth.js            # Gate local de acesso ao Admin
  admin-remaster.css       # UX adicional do Admin
  admin-remaster.js        # Busca, atalhos e estado de alterações

downloads/bats/            # Scripts distribuídos pelo site
```

## Recursos da Remaster

- Busca global por `Ctrl + K`
- Favoritos e perfis recentes salvos localmente
- Deep links de jogos via `?game=<id>#games`
- Valores do Performance Lab persistidos no navegador
- Busca e contagem de resultados no BAT Center
- Admin com filtro de jogos, atalhos `Ctrl + S` / `Ctrl + P` e aviso de alterações locais
- Cache busting de assets por versão
- Navegação mobile, estados de URL e modais revisados

## Preview pelo Admin

O Admin mantém compatibilidade com a chave `ares_v4_preview`. A Home pública ignora o preview normalmente; ele só é carregado quando aberta com `?preview=1`.

```text
https://areszjx.github.io/aresz-optimizer/?preview=1
```

## GitHub Pages

- Branch: `main`
- Pasta: `/ (root)`
- `.nojekyll` presente

## Princípios

- Ajustes legítimos e transparentes
- Sem cheats, recoil scripts ou bypass de anti-cheat
- Menus, logs e diagnóstico nos BATs AresZ
- Backup/restauração quando a alteração exige
- Interface responsiva e sem framework JavaScript obrigatório

> Observação: o login do Admin é uma barreira client-side porque o projeto é hospedado em GitHub Pages estático. Para segurança de servidor, seria necessário adicionar autenticação/backend externo.
