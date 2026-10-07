# 🔊 AURA VOLMAX - Acoustic Amplification System

App de amplificação acústica além dos 100%, com interface de estética **High-Ticket / Minimalista**, processamento de sinal em tempo real (DSP) e assistente 100% à prova de erros.

---

## 🚀 Como testar no Navegador (Preview Imediato)

O servidor de desenvolvimento local já está em execução:

* **Preview Local**: [http://localhost:5173/](http://localhost:5173/)
* **Preview na Rede Local (Smartphone na mesma rede Wi-Fi)**: `http://192.168.15.4:5173/`

### Funcionalidades do Preview:
1. **Dial Circular Dinâmico**: Controle gradual de 0% a 300% com indicador em tempo real e visual danger zone (+200%).
2. **Motor Web Audio Real**: Clique no botão **"Ouvir Teste Real"** para ouvir a amplificação, os harmônicos de graves e agudos gerados em tempo real pelo sintetizador.
3. **Limiter de Proteção de Hardware**: Compressor dinâmico ativado por padrão para evitar distorção harmônica e proteger os alto-falantes do celular.
4. **Equalizador Integrado**: Sub-Bass Boost (+18dB) e Clareza Vocal (+12dB).
5. **Perfis Pré-definidos**: Cinema & Bass, Pure Clarity, Ultra Max e Natural Hi-Fi.
6. **Assistente 100% Guiado**: Botão **"Guia do Sistema"** com orientações passo a passo para Android e iPhone.

---

## 📱 Estrutura Multiplataforma (Capacitor Cross-Platform)

O projeto foi configurado com **Capacitor 8**, gerando nativamente as pastas:
* `android/`: Projeto Android nativo pronto para compilação com Android Studio ou Gradle (`.apk` / `.aab`).
* `ios/`: Projeto Xcode nativo pronto para compilação no macOS.

### Comandos de Sincronização:
Sempre que fizer alterações na interface e quiser atualizar os projetos nativos:
```bash
npm run build
npx cap sync
```

---

## 🏬 Publicação nas Lojas: O que é Grátis e Regras Importantes

### 1. Google Play Store (Android)
* **Taxa da Loja**: O Google cobra uma taxa única de **US$ 25** para abrir a conta de desenvolvedor do Google Play Console (não é possível publicar gratuitamente na loja oficial sem essa taxa única).
* **Alternativa 100% Gratuita para Android**:
  * Você pode gerar o arquivo de instalação **APK** diretamente via Gradle (`./gradlew assembleRelease`), sem pagar nada.
  * O APK pode ser distribuído gratuitamente via site, GitHub Releases, Telegram ou lojas alternativas abertas (como F-Droid ou APKPure).

### 2. Apple App Store (iOS)
* **Taxa da Loja**: A Apple exige a assinatura anual do **Apple Developer Program** que custa **US$ 99 por ano**. A Apple não possui modalidade gratuita para publicar na App Store pública.
* **Alternativa Gratuita para iOS**:
  * Testes locais no seu próprio iPhone via cabo com conta Apple ID gratuita no Xcode (duração do certificado local: 7 dias por build).
  * Distribuição como **PWA (Progressive Web App)**: O usuário abre no Safari, clica em "Adicionar à Tela de Início" e o app funciona em tela cheia como se fosse nativo, com custo zero.
