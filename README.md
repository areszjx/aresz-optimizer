# ARES Performance Hub

Projeto do **AresZ** para organizar perfis de jogos, ferramentas de sensibilidade, otimizadores de sessão, rede, mouse e teclado em uma interface única.

## Estrutura v4

```text
index.html              # Home / Performance Hub
bats.html               # BAT Center
admin.html              # Painel de edição local
assets/
  ares-mark.svg         # Marca vetorial
  styles.css            # Design system principal
  admin.css             # Layout do Admin
  site-data.js          # Dados centralizados do site
  app.js                # Engine da Home
  bats.js               # Engine do BAT Center
  admin.js              # Engine do Admin
downloads/bats/         # Scripts distribuídos pelo site
```

## Preview pelo Admin

O Admin grava alterações em `localStorage` usando a chave `ares_v4_preview`. O site público ignora esse preview normalmente; ele só é carregado quando a Home é aberta com `?preview=1`.

Exemplo:

```text
https://areszjx.github.io/aresz-optimizer/?preview=1
```

## Publicação

GitHub Pages deve apontar para:

- Branch: `main`
- Pasta: `/ (root)`

## Princípios

- Ajustes legítimos e transparentes
- Sem cheats, recoil scripts ou bypass de anti-cheat
- Menus, logs e diagnóstico nos BATs AresZ
- Backup/restauração quando a alteração exige
- Interface responsiva e sem dependência de framework JavaScript
