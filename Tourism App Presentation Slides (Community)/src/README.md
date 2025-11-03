# 🌊 Guia de Turismo de Belmonte - Premium Travel App

Um aplicativo de turismo de nível internacional para Belmonte, Bahia, com IA interativa e experiência premium.

---

## 🚀 Funcionalidades Principais

### ✨ Sistema de Autenticação
- **Login/Cadastro** com validação completa
- **Credenciais Demo**:
  - 📧 Email: `demo@belmonte.com`
  - 🔐 Senha: `belmonte2024`
- Autenticação social (Google, Facebook, Apple)
- Mensagens de erro/sucesso em tempo real

### 🌍 Sistema Multilíngue
Suporte completo para 4 idiomas:
- 🇧🇷 **Português** (PT)
- 🇺🇸 **English** (EN)
- 🇪🇸 **Español** (ES)
- 🇫🇷 **Français** (FR)

Seletor de idioma acessível em todas as telas.

### 🗺️ Banco de Dados Completo
**15+ locais mapeados** com informações detalhadas:

#### Praias (3)
- Praia de Rio Grande
- Praia de Mogiquiçaba  
- Praia da Costa Dourada

#### Restaurantes (3)
- Restaurante Sabor Baiano
- Barraca da Dona Maria
- Pier do Pescador

#### Hotéis (2)
- Pousada Mar Azul
- Hotel Costa de Belmonte

#### Comércio (2)
- Arte Belmonte Artesanato
- Mercado dos Pescadores

#### Histórico (2)
- Igreja Matriz de Nossa Senhora do Carmo
- Casario Histórico do Centro

Cada local inclui:
- Coordenadas GPS reais de Belmonte
- Horários de funcionamento
- Preços e avaliações
- Contatos (telefone, WhatsApp, Instagram)
- Galeria de fotos
- Features e características

### 🗺️ Mapa Interativo
- Visualização com pontos categorizados
- Busca em tempo real
- Filtros por categoria
- Animações de pulso nos marcadores
- Panel de detalhes completo
- Botões de navegação e contato

### 🛣️ Roteiros Inteligentes
- 3 roteiros predefinidos com locais reais
- Filtros por dificuldade
- Informações de duração e paradas
- Destaques e melhores épocas
- CTA para criação personalizada com IA

### 📱 QR Code & App Mobile
- QR Code no perfil para download do app
- Experiência mobile-first
- Design responsivo premium

### 🤖 IA Bel - Assistente Virtual
- Mensagens contextuais por seção
- Animação de entrada espetacular
- Sugestões inteligentes
- Notificações personalizadas

### 🎨 Design Premium
- Inspirado em **Airbnb**, **Tesla** e **Yup**
- Glassmorphism avançado
- Microanimações fluidas
- Paleta oficial de Belmonte:
  - Azul profundo: #2C4D7B
  - Azul claro: #4C9ED9
  - Dourado: #F3A64D
- Tipografia premium (Poppins + Montserrat)
- Dark mode completo

---

## 🎯 Como Usar

### Login
1. Acesse a tela de login
2. Use as credenciais demo:
   - Email: `demo@belmonte.com`
   - Senha: `belmonte2024`
3. Aguarde a animação da Bel
4. Explore Belmonte!

### Trocar Idioma
1. Clique no seletor de idiomas (canto superior)
2. Escolha entre PT, EN, ES ou FR
3. Todo o app será traduzido instantaneamente

### Baixar App (via QR Code)
1. Acesse a aba "Perfil"
2. Clique no card "Baixar App"
3. Escaneie o QR Code exibido
4. Disponível para iOS e Android

---

## 🛠️ Tecnologias

- **React** + TypeScript
- **Tailwind CSS** v4.0
- **Motion** (Framer Motion)
- **Lucide Icons**
- **Context API** para i18n
- Componentes **ShadCN/UI**

---

## 📂 Estrutura do Projeto

```
/
├── components/
│   ├── LoginScreen.tsx          # Tela de autenticação
│   ├── LanguageSelector.tsx     # Seletor de idiomas
│   ├── ProfileScreen.tsx        # Perfil com QR Code
│   ├── MapScreen.tsx            # Mapa interativo
│   ├── RoutesScreen.tsx         # Roteiros inteligentes
│   ├── BelIntroAnimation.tsx    # Animação da Bel
│   └── ...
├── contexts/
│   └── LanguageContext.tsx      # Contexto de idiomas
├── data/
│   ├── belmonte-database.ts     # Banco de dados completo
│   └── translations.ts          # Sistema de traduções
├── styles/
│   └── globals.css              # Estilos globais + tipografia
└── App.tsx                      # App principal
```

---

## 🌟 Destaques

### Sistema de Autenticação
- ✅ Validação de email/senha
- ✅ Mensagens de erro personalizadas
- ✅ Animações de sucesso
- ✅ Login social mockado

### Internacionalização
- ✅ 4 idiomas completos
- ✅ 80+ strings traduzidas
- ✅ Context API para gerenciamento
- ✅ Persistência de preferência

### Banco de Dados
- ✅ 15+ locais mapeados
- ✅ Coordenadas GPS reais
- ✅ Informações completas
- ✅ Sistema de categorias

### Design
- ✅ Nível internacional premium
- ✅ Inspirado nos melhores apps de travel
- ✅ Microanimações em todos elementos
- ✅ Glassmorphism avançado
- ✅ Totalmente responsivo

---

## 🎨 Paleta de Cores

### Modo Claro
- Background: `#ffffff`
- Primary: `#2C4D7B` (Ocean Blue)
- Secondary: `#4C9ED9` (Sky Blue)
- Accent: `#F3A64D` (Sunset Gold)

### Modo Escuro
- Background: `#0a0e1a`
- Primary: `#6ba3d6`
- Secondary: `#4a7ba7`
- Accent: `#F3A64D`

---

## 📝 Próximos Passos Sugeridos

1. **Backend Real**
   - Integrar com API de autenticação
   - Persistir preferências do usuário
   - Sistema de favoritos em nuvem

2. **Funcionalidades Avançadas**
   - Reservas integradas
   - Pagamentos in-app
   - Chat com estabelecimentos
   - Gamificação expandida

3. **IA Aprimorada**
   - Integração com GPT para respostas reais
   - Recomendações personalizadas
   - Reconhecimento de voz

4. **Social Features**
   - Compartilhamento de roteiros
   - Reviews de usuários
   - Sistema de amigos

---

## 👨‍💻 Desenvolvido com

- ❤️ Paixão por Belmonte
- 🌊 Inspiração na costa baiana
- ✨ Tecnologia de ponta
- 🎨 Design de nível internacional

---

**Made in Bahia, Brasil** 🇧🇷

© 2024 Guia de Turismo de Belmonte. Todos os direitos reservados.