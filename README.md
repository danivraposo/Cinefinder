# 🎬 CineFinder

CineFinder é uma aplicação web desenvolvida em **React.js** para descobrir, organizar e comentar filmes e séries. Com integração à API do TMDb, permite aos utilizadores criar listas personalizadas, comentar conteúdos, e aos administradores moderar e destacar conteúdos.

---

## 🚀 Funcionalidades

- **Exploração de conteúdo**: pesquisa e visualização de detalhes de filmes e séries (sinopse, elenco, trailer, avaliação).
- **Criação de listas**: adicionar filmes e séries a listas públicas ou privadas, com tags e descrição.
- **Comentários**: escrever, editar e eliminar comentários sobre os conteúdos.
- **Gestão via Admin**:
  - destaque de listas criadas pelos utilizadores,
  - remoção de comentários ofensivos ou irrelevantes.
- **Autenticação**: registo e login de utilizadores, com roles (normal/admin).
- **Interface responsiva e acessível**: otimizada para mobile e desktop, com alto contraste e navegação por teclado.

---

## 🛠️ Tecnologias

- **Frontend**: React.js v18, React Router, Context API
- **Estilos**: CSS modular (Grid, Flexbox, media queries)
- **Dados**: TMDb API, localStorage
- **Controlo de versão**: Git, GitHub
- **Vídeos de teste**: gravações simuladas disponíveis via OneDrive

---

## 📂 Estrutura do Projeto

```
src/
├── components/           — Componentes reutilizáveis
├── contexts/             — AuthContext para gestão de utilizadores
├── pages/                — Páginas principais (Home, Details, Lists, Admin)
├── App.js                — Roteamento e layout base
├── index.js              — Entrada da aplicação
README.md
```

---

## 🎯 Usabilidade / Testes

- Testes funcionais simulados com 4 utilizadores (incluindo dois admins).
- Flows testados: criação de listas, comentários, destaque de conteúdo, edição e remoção.
- Formulários (pré e pós-teste) e vídeos com narrações disponíveis no OneDrive.

---

## 📁 Links Importantes

- **Código-fonte**: https://github.com/danivraposo/Cinefinder  
- **Vídeos de testes e formulários**: https://ipbejapt‑my.sharepoint.com/:f:/g/personal/24155_stu_ipbeja_pt/Ekkj8z17qGNHlw5vqWGhBjIBry6qqzlK45PY74xvM6kNtQ?e=Sd9wT6  

---

## 🛠️ Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/danivraposo/Cinefinder.git

# 2. Instale as dependências
cd Cinefinder
npm install

# 3. Adicione as variáveis ambiente (TMDb API Key)
# Crie um ficheiro .env com a chave TMDB_API_KEY

# 4. Inicie a aplicação em modo de desenvolvimento
npm start
```

A aplicação estará disponível por defeito em `http://localhost:3000`.

---

## 🧩 Uso

1. Regista-te ou faz login.
2. Pesquisa por filmes/séries e explora os detalhes.
3. Clica em **“Adicionar à lista”** para criar ou usar uma lista existente.
4. No detalhe, comenta, edita ou apaga os teus comentários.
5. Se fores administrador, podes:
   - destacar listas de utilizadores,
   - remover comentários de qualquer utilizador.

---

## ✅ Sugestões para trabalho futuro

- Implementar **likes** nos comentários
- Introduzir **notificações** para eventos nas listas/comentários
- Criar **perfil público de utilizador** para exibir listas criadas
- Internacionalização (i18n)
- Integração com plataformas de streaming ("onde assistir")

---

## 📄 Licença

Projeto disponibilizado sob a licença MIT.

---

## 🙌 Contribuições

Contribuições são bem-vindas! Abre um *issue* ou envia um *pull request* com melhorias, correções ou sugestões.
