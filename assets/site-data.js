window.ARES_DATA = {
  version: "4.0.0",
  brand: {
    owner: "AresZ",
    name: "ARES Performance Hub",
    eyebrow: "PERFORMANCE • INPUT • NETWORK • GAME PROFILES",
    heroTitle: "Performance com controle. <span>Configs com contexto.</span>",
    heroText: "Perfis de jogos, ferramentas de sensibilidade, otimizadores de sessão e downloads organizados em uma experiência única, rápida e profissional.",
    heroNote: "Ajustes legítimos, transparentes e reversíveis — sem cheats, bypasses ou promessas irreais."
  },
  categories: [
    { id: "all", label: "Todos" },
    { id: "fps", label: "FPS" },
    { id: "battle", label: "Battle Royale" },
    { id: "sandbox", label: "Sandbox" }
  ],
  games: [
    {
      id: "cs2",
      name: "Counter-Strike 2",
      short: "CS2",
      badge: "Competitive FPS",
      categories: ["fps"],
      platform: "Steam",
      focus: "Latência + visibilidade",
      image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/capsule_616x353.jpg",
      cover: "linear-gradient(135deg,#ff8a00 0%,#3a1d0b 55%,#0d0f16 100%)",
      description: "Perfil competitivo com foco em visibilidade, estabilidade de frame time e consistência de input.",
      official: "https://www.counter-strike.net/cs2",
      settings: [
        ["V-Sync", "Off"],
        ["NVIDIA Reflex", "Enabled + Boost"],
        ["MSAA", "2x ou 4x"],
        ["Shadows", "Low / Medium"],
        ["Texture Filtering", "4x / 8x"]
      ],
      tips: [
        "Priorize FPS estável acima da taxa de atualização do monitor.",
        "Use eDPI para comparar sensibilidades entre setups.",
        "Evite alterar sensibilidade com frequência; consistência costuma valer mais do que números extremos."
      ],
      downloads: [
        { label: "AresZ Advanced Session Optimizer", type: "BAT", href: "downloads/bats/cs2-ares-optimizer.bat" }
      ]
    },
    {
      id: "warzone",
      name: "Call of Duty: Warzone",
      short: "WZ",
      badge: "Battle Royale",
      categories: ["battle", "fps"],
      platform: "Steam / Battle.net",
      focus: "FPS + VRAM",
      image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1938090/capsule_616x353.jpg",
      cover: "linear-gradient(135deg,#38404a 0%,#161a20 50%,#090b0f 100%)",
      description: "Preset competitivo para reduzir distrações visuais, controlar uso de VRAM e manter boa leitura do cenário.",
      official: "https://www.callofduty.com/warzone",
      settings: [
        ["V-Sync", "Off"],
        ["Motion Blur", "Off"],
        ["Film Grain", "0"],
        ["NVIDIA Reflex", "On + Boost"],
        ["VRAM Target", "70–80%"]
      ],
      tips: [
        "Teste Textures em Normal se sua GPU tiver VRAM suficiente.",
        "Mantenha deadzone baixa apenas se o controle não apresentar drift.",
        "Estabilidade costuma importar mais do que perseguir um pico máximo de FPS."
      ],
      downloads: [
        { label: "AresZ Advanced Session Optimizer", type: "BAT", href: "downloads/bats/warzone-ares-optimizer.bat" }
      ]
    },
    {
      id: "fortnite",
      name: "Fortnite",
      short: "FN",
      badge: "Battle Royale",
      categories: ["battle", "fps"],
      platform: "Epic Games",
      focus: "Performance Mode / DX12",
      image: "",
      cover: "linear-gradient(135deg,#2454ff 0%,#6a3dff 48%,#1ac7ff 100%)",
      description: "Perfil para comparar Performance Mode e DX12, melhorar legibilidade e controlar custo visual.",
      official: "https://www.fortnite.com/",
      settings: [
        ["Rendering Mode", "Performance ou DX12"],
        ["V-Sync", "Off"],
        ["Shadows", "Off"],
        ["Textures", "Low / Medium"],
        ["Effects", "Low"]
      ],
      tips: [
        "Compare Performance Mode e DX12 no seu próprio hardware.",
        "Use resolução 3D menor apenas quando necessário para manter estabilidade.",
        "Mantenha multiplicadores de build/edit fáceis de memorizar."
      ],
      downloads: [
        { label: "AresZ Advanced Session Optimizer", type: "BAT", href: "downloads/bats/fortnite-ares-optimizer.bat" }
      ]
    },
    {
      id: "valorant",
      name: "VALORANT",
      short: "VAL",
      badge: "Tactical FPS",
      categories: ["fps"],
      platform: "Riot Client",
      focus: "eDPI + clareza",
      image: "",
      cover: "linear-gradient(135deg,#ff4655 0%,#3d1620 55%,#0f1016 100%)",
      description: "Perfil competitivo enxuto com foco em eDPI, clareza visual e baixa carga gráfica.",
      official: "https://playvalorant.com/",
      settings: [
        ["V-Sync", "Off"],
        ["Material Quality", "Low"],
        ["Texture Quality", "Low"],
        ["Detail Quality", "Low"],
        ["UI Quality", "Low"]
      ],
      tips: [
        "eDPI = DPI × sensibilidade do jogo.",
        "Tela cheia ajuda a manter um fluxo consistente em muitos setups.",
        "Não altere Vanguard, serviços de segurança ou arquivos internos do jogo."
      ],
      downloads: [
        { label: "AresZ Advanced Session Optimizer", type: "BAT", href: "downloads/bats/valorant-ares-optimizer.bat" }
      ]
    },
    {
      id: "apex",
      name: "Apex Legends",
      short: "APX",
      badge: "Battle Royale",
      categories: ["battle", "fps"],
      platform: "Steam / EA",
      focus: "Tracking + visibilidade",
      image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1172470/capsule_616x353.jpg",
      cover: "linear-gradient(135deg,#b22b3a 0%,#42141a 55%,#111217 100%)",
      description: "Perfil para tracking consistente, leitura de cenário e redução de efeitos visuais desnecessários.",
      official: "https://www.ea.com/games/apex-legends",
      settings: [
        ["V-Sync", "Off"],
        ["Ambient Occlusion", "Disabled"],
        ["Volumetric Lighting", "Disabled"],
        ["Texture Streaming", "2–4 GB"],
        ["Ragdolls", "Low"]
      ],
      tips: [
        "Ajuste Texture Streaming de acordo com sua VRAM.",
        "Tracking melhora mais com consistência de sensibilidade do que com alterações frequentes.",
        "Evite gargalo térmico em sessões longas."
      ],
      downloads: [
        { label: "AresZ Advanced Session Optimizer", type: "BAT", href: "downloads/bats/apex-ares-optimizer.bat" }
      ]
    },
    {
      id: "pubg",
      name: "PUBG: Battlegrounds",
      short: "PUBG",
      badge: "Battle Royale",
      categories: ["battle", "fps"],
      platform: "Steam",
      focus: "Leitura + consistência",
      image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/578080/capsule_616x353.jpg",
      cover: "linear-gradient(135deg,#b48a35 0%,#3a301d 55%,#111218 100%)",
      description: "Configuração equilibrada para preservar leitura do cenário sem gastar recursos em efeitos secundários.",
      official: "https://pubg.com/",
      settings: [
        ["Textures", "Medium"],
        ["Shadows", "Very Low"],
        ["Effects", "Very Low"],
        ["Foliage", "Very Low"],
        ["View Distance", "Medium"]
      ],
      tips: [
        "Spray control deve vir de prática e sensibilidade consistente.",
        "Use Foliage baixo para reduzir distrações.",
        "Ajuste antialiasing conforme a nitidez do seu monitor."
      ],
      downloads: [
        { label: "AresZ Advanced Session Optimizer", type: "BAT", href: "downloads/bats/pubg-ares-optimizer.bat" }
      ]
    },
    {
      id: "finals",
      name: "THE FINALS",
      short: "TF",
      badge: "Arena FPS",
      categories: ["fps"],
      platform: "Steam",
      focus: "Upscaling + frame time",
      image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2073850/capsule_616x353.jpg",
      cover: "linear-gradient(135deg,#ff3b2f 0%,#5b1715 50%,#111216 100%)",
      description: "Perfil focado em frame time estável, efeitos reduzidos e uso inteligente de upscaling.",
      official: "https://www.reachthefinals.com/",
      settings: [
        ["Ray Tracing", "Off"],
        ["Shadows", "Low"],
        ["Effects", "Low"],
        ["Textures", "Medium"],
        ["Upscaling", "Conforme a GPU"]
      ],
      tips: [
        "Teste DLSS, FSR ou XeSS conforme sua GPU e resolução.",
        "Compare frame time, não apenas FPS médio.",
        "Efeitos e sombras são bons pontos para reduzir carga."
      ],
      downloads: [
        { label: "AresZ Advanced Session Optimizer", type: "BAT", href: "downloads/bats/the-finals-ares-optimizer.bat" }
      ]
    },
    {
      id: "minecraft",
      name: "Minecraft",
      short: "MC",
      badge: "Sandbox",
      categories: ["sandbox"],
      platform: "Java / Bedrock",
      focus: "Chunks + simulação",
      image: "",
      cover: "linear-gradient(135deg,#61b94f 0%,#315e2a 48%,#47331f 100%)",
      description: "Perfil para equilibrar render distance, simulation distance e efeitos de ambiente.",
      official: "https://www.minecraft.net/",
      settings: [
        ["Render Distance", "8–16"],
        ["Simulation Distance", "5–8"],
        ["Clouds", "Off"],
        ["Particles", "Minimal / Decreased"],
        ["Graphics", "Fast / Normal"]
      ],
      tips: [
        "Menos chunks normalmente melhora estabilidade em CPUs mais modestas.",
        "Shaders mudam completamente o perfil de desempenho.",
        "Java e Bedrock podem ter gargalos diferentes no mesmo PC."
      ],
      downloads: [
        { label: "AresZ Advanced Session Optimizer", type: "BAT", href: "downloads/bats/minecraft-ares-optimizer.bat" }
      ]
    },
    {
      id: "roblox",
      name: "Roblox",
      short: "RBX",
      badge: "Sandbox",
      categories: ["sandbox"],
      platform: "Roblox Player",
      focus: "Qualidade manual",
      image: "",
      cover: "linear-gradient(135deg,#d8d9e0 0%,#666b78 48%,#1d2028 100%)",
      description: "Perfil simples e seguro para controlar qualidade gráfica e reduzir carga de fundo.",
      official: "https://www.roblox.com/",
      settings: [
        ["Graphics Mode", "Manual"],
        ["Graphics Quality", "2–5 para FPS"],
        ["Fullscreen", "On"],
        ["Background Apps", "Mínimo possível"],
        ["Windows Game Mode", "On"]
      ],
      tips: [
        "Cada experiência pode ter um ponto ideal diferente.",
        "Feche overlays e gravadores se estiverem causando quedas.",
        "O BAT não usa exploit, cliente modificado ou bypass."
      ],
      downloads: [
        { label: "AresZ Advanced Session Optimizer", type: "BAT", href: "downloads/bats/roblox-ares-optimizer.bat" }
      ]
    }
  ],
  optimizers: [
    {
      id: "network",
      icon: "NET",
      title: "Network Optimizer",
      subtitle: "Diagnóstico e baseline de rede",
      description: "Central de diagnóstico para TCP, DNS, adaptadores, latência e reparo de Winsock/IP quando necessário.",
      accent: "#5B8CFF",
      features: ["Gaming Network Baseline", "Diagnóstico completo", "Flush DNS", "Relatório de rede"],
      href: "downloads/bats/internet-ares-latency.bat",
      restore: ""
    },
    {
      id: "mouse",
      icon: "MSE",
      title: "Mouse & Sens",
      subtitle: "Input baseline + eDPI",
      description: "Gerenciador de aceleração do Windows, velocidade do ponteiro, backup automático e calculadora de eDPI.",
      accent: "#D65CFF",
      features: ["Backup automático", "Perfil competitivo", "Leitura dos valores", "Restore separado"],
      href: "downloads/bats/mouse-ares-competitive.bat",
      restore: "downloads/bats/mouse-ares-restore.bat"
    },
    {
      id: "keyboard",
      icon: "KEY",
      title: "Keyboard Optimizer",
      subtitle: "Repeat rate + delay",
      description: "Perfis de repetição e atraso do Windows com backup, visualização do estado atual e restauração.",
      accent: "#FF4FB3",
      features: ["Perfil competitivo", "Perfil balanceado", "Backup automático", "Restore separado"],
      href: "downloads/bats/keyboard-ares-competitive.bat",
      restore: "downloads/bats/keyboard-ares-restore.bat"
    }
  ],
  faq: [
    ["Os otimizadores garantem mais FPS ou ping menor?", "Não. Eles organizam ajustes, diagnóstico e automações que podem melhorar consistência dependendo do gargalo do PC e da rede. Não existe ganho garantido para todos os sistemas."],
    ["Os BATs mexem em anti-cheat, recoil ou mira?", "Não. A proposta do ARES é trabalhar com sistema, energia, processo, rede e preferências legítimas. Nada de recoil scripts, cheats ou bypasses."],
    ["Posso desfazer as alterações?", "Os módulos de mouse e teclado possuem backup e restore. Os otimizadores por jogo restauram o plano de energia anterior ao fim da sessão. O módulo de rede separa diagnóstico, baseline e reparo."],
    ["O site funciona no celular?", "Sim. A interface foi projetada para desktop e mobile, mas os BATs são destinados ao Windows." ]
  ]
};
