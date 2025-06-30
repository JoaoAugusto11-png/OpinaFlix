# 🎬 OpinaFlix

Uma plataforma web moderna para críticas e avaliações de filmes e séries, onde usuários podem descobrir, avaliar e compartilhar suas opiniões sobre obras cinematográficas.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [API](#api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

OpinaFlix é uma aplicação web que permite aos usuários:
- Descobrir filmes e séries populares
- Avaliar obras com sistema de estrelas (1-10)
- Criar e gerenciar coleções personalizadas
- Seguir outros usuários e ver suas avaliações
- Gerenciar perfil com foto e informações pessoais

A aplicação utiliza a API do The Movie Database (TMDB) para obter informações sobre filmes e séries, fornecendo dados atualizados sobre lançamentos, sinopses, elenco e avaliações.

## ✨ Funcionalidades

### 🔐 Autenticação
- [x] Cadastro de usuário
- [x] Login/Logout
- [x] Gerenciamento de sessão com localStorage

### 🎬 Filmes e Séries
- [x] Visualização de filmes populares
- [x] Busca por filmes e séries
- [x] Detalhes completos das obras (sinopse, elenco, avaliações)
- [x] Sistema de avaliação com estrelas (1-10)
- [x] Integração com TMDB API

### 👥 Sistema Social
- [x] Perfis de usuário personalizáveis
- [x] Upload de foto de perfil
- [x] Sistema de seguir/deixar de seguir
- [x] Reviews públicas

### 📚 Coleções
- [x] Criação de coleções personalizadas
- [x] Adição/remoção de filmes nas coleções
- [x] Compartilhamento de coleções
- [x] Exclusão de coleções próprias

### 🎨 Interface
- [x] Design responsivo
- [x] Tema escuro elegante
- [x] Animações e transições suaves
- [x] Interface intuitiva e moderna

## 🚀 Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização e layout responsivo
- **JavaScript (ES6+)** - Interatividade e funcionalidades
- **Font Awesome** - Ícones
- **TMDB API** - Dados de filmes e séries

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados
- **Multer** - Upload de arquivos
- **CORS** - Política de CORS

### Estrutura de Dados
- **SQLite Database** - Armazenamento local
- **localStorage** - Sessão do usuário
- **RESTful API** - Arquitetura de API

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com Node.js)
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/opinaflex.git
cd opinaflex
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
   - O projeto já vem configurado com a API key do TMDB
   - Para usar sua própria API key, substitua em `src/index.html`, `src/filmes-series.html` e `src/detalhes-obra.html`

4. **Inicie o servidor backend:**
```bash
npm start
# ou
node backend/index.js
```

5. **Acesse a aplicação:**
   - Abra seu navegador e vá para: `http://localhost:8080` (ou use Live Server)
   - O backend estará rodando em: `http://localhost:3001`

## 📖 Como Usar

### 1. Primeiros Passos
1. Acesse a página inicial
2. Clique em "Cadastre-se Grátis" ou "Entrar"
3. Crie sua conta ou faça login

### 2. Explorando Filmes
1. Na página inicial, veja os filmes populares da semana
2. Use a barra de busca para encontrar filmes específicos
3. Clique em qualquer filme para ver detalhes
4. Avalie filmes usando o sistema de estrelas

### 3. Criando Coleções
1. Vá para a seção "Coleções"
2. Clique em "Nova Coleção"
3. Adicione filmes à sua coleção
4. Compartilhe com outros usuários

### 4. Personalizando Perfil
1. Acesse seu perfil
2. Faça upload de uma foto
3. Siga outros usuários
4. Veja suas avaliações e coleções

## 🔌 API

### Endpoints Principais

#### Usuários
- `POST /api/usuarios` - Criar usuário
- `POST /api/login` - Fazer login
- `GET /api/usuarios/:id` - Obter dados do usuário

#### Perfil
- `POST /api/perfil/:id/foto` - Upload de foto de perfil
- `POST /api/perfil/:id/seguir` - Seguir usuário
- `DELETE /api/perfil/:id/seguir` - Deixar de seguir

#### Avaliações
- `POST /api/avaliacoes` - Criar avaliação
- `GET /api/avaliacoes/:usuarioId` - Obter avaliações do usuário
- `GET /api/avaliacoes/obra/:obraId/:tipo` - Avaliações de uma obra

#### Coleções
- `POST /api/colecoes` - Criar coleção
- `GET /api/colecoes/usuario/:id` - Obter coleções do usuário
- `POST /api/colecoes/:id/filmes` - Adicionar filme à coleção
- `DELETE /api/colecoes/:id` - Excluir coleção

## 📁 Estrutura do Projeto

```
OpinaFlix/
├── src/                          # Frontend
│   ├── css/
│   │   └── style.css            # Estilos principais
│   ├── js/
│   │   └── auth.js              # Utilitários de autenticação
│   ├── index.html               # Página inicial
│   ├── login.html               # Página de login
│   ├── cadastro.html            # Página de cadastro
│   ├── filmes-series.html       # Busca e listagem
│   ├── detalhes-obra.html       # Detalhes do filme/série
│   ├── colecoes.html            # Gerenciar coleções
│   ├── colecao-detalhe.html     # Detalhes da coleção
│   ├── perfil.html              # Perfil do usuário
│   └── review-galera.html       # Reviews da comunidade
├── backend/                      # Backend
│   ├── controllers/             # Controladores da API
│   ├── models/                  # Modelos de dados
│   ├── routes/                  # Rotas da API
│   ├── middleware/              # Middlewares
│   ├── uploads/                 # Arquivos enviados
│   ├── db.js                    # Configuração do banco
│   ├── index.js                 # Servidor principal
│   └── opinaflix.db            # Banco SQLite
├── package.json                 # Dependências e scripts
└── README.md                    # Este arquivo
```

## 🎨 Design e UX

O OpinaFlix foi projetado com foco na experiência do usuário:

- **Design Minimalista**: Interface limpa inspirada em plataformas de streaming
- **Tema Escuro**: Reduz fadiga visual durante uso prolongado
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animações Sutis**: Transições suaves para melhor experiência
- **Iconografia Consistente**: Font Awesome para ícones padronizados

## 🧪 Testes

Para testar a aplicação:

1. **Teste de Cadastro/Login:**
   - Crie uma conta nova
   - Faça login e logout
   - Verifique persistência da sessão

2. **Teste de Funcionalidades:**
   - Busque por filmes
   - Avalie algumas obras
   - Crie coleções
   - Siga outros usuários

3. **Teste de Responsividade:**
   - Redimensione a janela do navegador
   - Teste em dispositivos móveis
   - Verifique todos os breakpoints

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição
- Siga os padrões de código existentes
- Adicione comentários em código complexo
- Teste suas mudanças antes de submeter
- Atualize a documentação se necessário

## 🐛 Reportando Bugs

Encontrou um bug? Ajude-nos a melhorar:

1. Verifique se o bug já foi reportado nas Issues
2. Se não, crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se aplicável
   - Informações do ambiente (navegador, OS, etc.)

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de comentários em avaliações
- [ ] Notificações em tempo real
- [ ] Recomendações personalizadas
- [ ] Sistema de badges/conquistas
- [ ] API de estatísticas de usuário
- [ ] Integração com redes sociais
- [ ] Modo claro/escuro toggle
- [ ] PWA (Progressive Web App)

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Documentação da API com Swagger
- [ ] Cache de dados da TMDB
- [ ] Otimização de imagens
- [ ] Lazy loading
- [ ] Service Workers

## 📞 Suporte

Se você precisar de ajuda ou tiver dúvidas sobre o projeto, você pode:

- Abrir uma issue no repositório
- Consultar a documentação do código
- Verificar os exemplos de uso nas páginas

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [The Movie Database (TMDB)](https://www.themoviedb.org/) pelos dados de filmes
- [Font Awesome](https://fontawesome.com/) pelos ícones
- Comunidade open source pelo feedback e contribuições

---

<div align="center">
  <p>Feito com ❤️ para aprender e compartilhar conhecimento</p>
  <p>
    <a href="#top">🔝 Voltar ao topo</a>
  </p>
</div>