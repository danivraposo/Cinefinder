import React, { createContext, useState, useContext, useEffect } from 'react';

// Usuários predefinidos
const predefinedUsers = [
  {
    id: 1,
    username: 'manuel',
    password: 'senha123',
    name: 'Manuel',
    role: 'cinefilo',
    watchlist: [],
    comments: [],
    ratings: [],
    customLists: []
  },
  {
    id: 2,
    username: 'jose',
    password: 'admin123',
    name: 'José',
    role: 'admin',
    watchlist: [],
    comments: [],
    ratings: [],
    customLists: []
  }
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : predefinedUsers;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário já está logado ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Salvar usuários no localStorage quando houver alterações
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Login
  const login = (username, password) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, message: 'Nome de usuário ou senha incorretos' };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  // Adicionar filme/série à watchlist
  const addToWatchlist = (mediaItem) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Verificar se o item já está na watchlist
    const isAlreadyInWatchlist = users[userIndex].watchlist.some(item => item.id === mediaItem.id);
    if (isAlreadyInWatchlist) {
      return { success: false, message: 'Este item já está na sua watchlist' };
    }
    
    // Adicionar à watchlist
    const updatedUsers = [...users];
    updatedUsers[userIndex].watchlist.push(mediaItem);
    setUsers(updatedUsers);
    
    // Atualizar currentUser
    const updatedUser = { ...currentUser, watchlist: [...currentUser.watchlist, mediaItem] };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return { success: true, message: 'Item adicionado à watchlist' };
  };

  // Remover filme/série da watchlist
  const removeFromWatchlist = (mediaId) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Remover da watchlist
    const updatedUsers = [...users];
    updatedUsers[userIndex].watchlist = updatedUsers[userIndex].watchlist.filter(
      item => item.id !== mediaId
    );
    setUsers(updatedUsers);
    
    // Atualizar currentUser
    const updatedUser = { 
      ...currentUser, 
      watchlist: currentUser.watchlist.filter(item => item.id !== mediaId) 
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return { success: true, message: 'Item removido da watchlist' };
  };

  // Buscar filmes ou séries na API TMDB
  const searchMedia = async (query, type = 'movie') => {
    if (!query) return { success: false, message: 'Termo de busca não fornecido' };
    
    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    if (!apiKey) return { success: false, message: 'API key não configurada' };
    
    try {
      const url = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        // Adicionar o tipo de mídia aos resultados
        const resultsWithType = data.results.map(item => ({
          ...item,
          media_type: type
        }));
        
        return { 
          success: true, 
          results: resultsWithType,
          total_results: data.total_results
        };
      } else {
        return { success: false, message: 'Nenhum resultado encontrado' };
      }
    } catch (error) {
      console.error('Erro ao buscar mídia:', error);
      return { success: false, message: 'Erro ao buscar mídia' };
    }
  };

  // Adicionar comentário
  const addComment = (mediaId, mediaType, commentText) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    const newComment = {
      id: Date.now(),
      userId: currentUser.id,
      mediaId,
      mediaType,
      text: commentText,
      createdAt: new Date().toISOString(),
      username: currentUser.username
    };
    
    // Adicionar comentário
    const updatedUsers = [...users];
    updatedUsers[userIndex].comments.push(newComment);
    setUsers(updatedUsers);
    
    // Atualizar currentUser
    const updatedUser = { 
      ...currentUser, 
      comments: [...currentUser.comments, newComment] 
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return { success: true, comment: newComment };
  };

  // Editar comentário
  const editComment = (commentId, newText) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    const commentIndex = users[userIndex].comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return { success: false, message: 'Comentário não encontrado' };
    
    // Verificar se o utilizador é dono do comentário ou é admin
    const isOwnerOrAdmin = 
      users[userIndex].comments[commentIndex].userId === currentUser.id || 
      currentUser.role === 'admin';
      
    if (!isOwnerOrAdmin) {
      return { success: false, message: 'Você não tem permissão para editar este comentário' };
    }
    
    // Editar comentário
    const updatedUsers = [...users];
    updatedUsers[userIndex].comments[commentIndex].text = newText;
    updatedUsers[userIndex].comments[commentIndex].editedAt = new Date().toISOString();
    setUsers(updatedUsers);
    
    // Atualizar currentUser se for o dono do comentário
    if (users[userIndex].comments[commentIndex].userId === currentUser.id) {
      const updatedComments = [...currentUser.comments];
      const currentUserCommentIndex = updatedComments.findIndex(c => c.id === commentId);
      if (currentUserCommentIndex !== -1) {
        updatedComments[currentUserCommentIndex].text = newText;
        updatedComments[currentUserCommentIndex].editedAt = new Date().toISOString();
        
        const updatedUser = { ...currentUser, comments: updatedComments };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }
    
    return { success: true, message: 'Comentário atualizado com sucesso' };
  };

  // Remover comentário (apenas admin pode remover qualquer comentário)
  const removeComment = (commentId, userId) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    // Verificar se é o dono do comentário ou admin
    const isAdmin = currentUser.role === 'admin';
    const isOwner = currentUser.id === userId;
    
    if (!isAdmin && !isOwner) {
      return { success: false, message: 'Você não tem permissão para remover este comentário' };
    }
    
    // Encontrar utilizador que fez o comentário
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Remover comentário
    const updatedUsers = [...users];
    updatedUsers[userIndex].comments = updatedUsers[userIndex].comments.filter(
      c => c.id !== commentId
    );
    setUsers(updatedUsers);
    
    // Atualizar currentUser se for o dono do comentário
    if (userId === currentUser.id) {
      const updatedUser = { 
        ...currentUser, 
        comments: currentUser.comments.filter(c => c.id !== commentId) 
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    return { success: true, message: 'Comentário removido com sucesso' };
  };

  // Funções de administrador
  const createUser = (userData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    // Verificar se o username já existe
    const usernameExists = users.some(u => u.username === userData.username);
    if (usernameExists) {
      return { success: false, message: 'Este nome de utilizador já está em uso' };
    }
    
    const newUser = {
      id: Date.now(),
      ...userData,
      watchlist: [],
      comments: [],
      ratings: [],
      customLists: []
    };
    
    setUsers([...users, newUser]);
    return { success: true, user: newUser };
  };

  const updateUser = (userId, userData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Verificar se está tentando alterar o username para um que já existe
    if (userData.username && userData.username !== users[userIndex].username) {
      const usernameExists = users.some(u => u.username === userData.username && u.id !== userId);
      if (usernameExists) {
        return { success: false, message: 'Este nome de utilizador já está em uso' };
      }
    }
    
    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...userData };
    setUsers(updatedUsers);
    
    return { success: true, user: updatedUsers[userIndex] };
  };

  const deactivateUser = (userId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    const updatedUsers = [...users];
    updatedUsers[userIndex].active = false;
    setUsers(updatedUsers);
    
    return { success: true, message: 'Utilizador desativado com sucesso' };
  };

  // Reativar utilizador (apenas admin pode reativar)
  const activateUser = (userId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    const updatedUsers = [...users];
    updatedUsers[userIndex].active = true;
    setUsers(updatedUsers);
    
    return { success: true, message: 'Utilizador reativado com sucesso' };
  };

  // Excluir utilizador (apenas admin pode excluir)
  const deleteUser = (userId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }

    // Verificar se está tentando excluir um dos utilizadores pré-definidos
    if (userId === 1 || userId === 2) {
      return { success: false, message: 'Não é possível excluir utilizadores pré-definidos do sistema' };
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Excluir o utilizador
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    
    return { success: true, message: 'Utilizador excluído com sucesso' };
  };

  // Obter todos os comentários de um filme/série
  const getMediaComments = (mediaId) => {
    // Coletar todos os comentários de todos os utilizadores para o mediaId específico
    const allComments = users.flatMap(user => 
      user.comments.filter(comment => comment.mediaId === mediaId)
    );
    
    // Filtrar comentários duplicados por ID
    const uniqueComments = allComments.filter((comment, index, self) =>
      index === self.findIndex(c => c.id === comment.id)
    );
    
    // Ordenar por data de criação (mais recentes primeiro)
    return uniqueComments.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  // Obter todos os utilizadores (apenas para admin)
  const getAllUsers = () => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    return { success: true, users: users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    })};
  };

  // ----- RATING SYSTEM -----
  
  // Add/Update a rating for a media item
  const rateMedia = (mediaId, mediaType, rating, mediaTitle) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Initialize ratings array if it doesn't exist
    if (!users[userIndex].ratings) {
      users[userIndex].ratings = [];
    }
    
    // Check if user has already rated this media
    const existingRatingIndex = users[userIndex].ratings.findIndex(
      r => r.mediaId === mediaId && r.mediaType === mediaType
    );
    
    const updatedUsers = [...users];
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      updatedUsers[userIndex].ratings[existingRatingIndex] = {
        ...updatedUsers[userIndex].ratings[existingRatingIndex],
        rating,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new rating
      const newRating = {
        id: Date.now(),
        mediaId,
        mediaType,
        mediaTitle: mediaTitle || 'Untitled',
        rating,
        createdAt: new Date().toISOString()
      };
      
      updatedUsers[userIndex].ratings.push(newRating);
    }
    
    // Update users state
    setUsers(updatedUsers);
    
    // Update currentUser
    const updatedRatings = existingRatingIndex !== -1 
      ? [...currentUser.ratings]
      : [...(currentUser.ratings || [])];
      
    if (existingRatingIndex !== -1) {
      updatedRatings[existingRatingIndex] = {
        ...updatedRatings[existingRatingIndex],
        rating,
        updatedAt: new Date().toISOString()
      };
    } else {
      updatedRatings.push({
        id: Date.now(),
        mediaId,
        mediaType,
        mediaTitle: mediaTitle || 'Untitled',
        rating,
        createdAt: new Date().toISOString()
      });
    }
    
    const updatedUser = { 
      ...currentUser, 
      ratings: updatedRatings 
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return { 
      success: true, 
      message: existingRatingIndex !== -1 ? 'Avaliação atualizada' : 'Avaliação adicionada' 
    };
  };
  
  // Get user's rating for a specific media
  const getUserRating = (mediaId, mediaType) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const ratings = currentUser.ratings || [];
    const userRating = ratings.find(
      r => r.mediaId === mediaId && r.mediaType === mediaType
    );
    
    return { 
      success: true, 
      rating: userRating ? userRating.rating : null 
    };
  };
  
  // Delete a user's rating
  const deleteRating = (mediaId, mediaType) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Check if user has rated this media
    const ratings = users[userIndex].ratings || [];
    const ratingIndex = ratings.findIndex(
      r => r.mediaId === mediaId && r.mediaType === mediaType
    );
    
    if (ratingIndex === -1) {
      return { success: false, message: 'Avaliação não encontrada' };
    }
    
    // Remove rating
    const updatedUsers = [...users];
    updatedUsers[userIndex].ratings = ratings.filter(
      (_, index) => index !== ratingIndex
    );
    setUsers(updatedUsers);
    
    // Update currentUser
    const updatedUser = { 
      ...currentUser, 
      ratings: (currentUser.ratings || []).filter(
        r => !(r.mediaId === mediaId && r.mediaType === mediaType)
      ) 
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return { success: true, message: 'Avaliação removida' };
  };
  
  // Get average rating for a media item
  const getAverageRating = (mediaId, mediaType) => {
    const allRatings = users
      .flatMap(user => user.ratings || [])
      .filter(rating => rating.mediaId === mediaId && rating.mediaType === mediaType);
    
    if (allRatings.length === 0) {
      return { success: true, averageRating: 0, totalRatings: 0 };
    }
    
    const sum = allRatings.reduce((total, item) => total + item.rating, 0);
    const average = sum / allRatings.length;
    
    return { 
      success: true, 
      averageRating: average, 
      totalRatings: allRatings.length 
    };
  };

  // ----- CUSTOM LISTS -----
  
  // Create a new custom list
  const createList = (listData) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Initialize customLists array if it doesn't exist
    if (!users[userIndex].customLists) {
      users[userIndex].customLists = [];
    }
    
    const newList = {
      id: Date.now(),
      userId: currentUser.id,
      name: listData.name,
      description: listData.description || '',
      isPublic: listData.isPublic || false,
      tags: listData.tags || [],
      items: listData.items || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to user's lists
    const updatedUsers = [...users];
    updatedUsers[userIndex].customLists.push(newList);
    setUsers(updatedUsers);
    
    // Update currentUser
    const updatedUser = { 
      ...currentUser, 
      customLists: [...(currentUser.customLists || []), newList] 
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return { success: true, list: newList };
  };
  
  // Update an existing list
  const updateList = (listId, listData) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Find list in user's lists
    const userLists = users[userIndex].customLists || [];
    const listIndex = userLists.findIndex(list => list.id === listId);
    
    // Check if list exists and user has permission
    if (listIndex === -1) {
      return { success: false, message: 'Lista não encontrada' };
    }
    
    if (userLists[listIndex].userId !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, message: 'Você não tem permissão para editar esta lista' };
    }
    
    // Update list
    const updatedList = {
      ...userLists[listIndex],
      name: listData.name !== undefined ? listData.name : userLists[listIndex].name,
      description: listData.description !== undefined ? listData.description : userLists[listIndex].description,
      isPublic: listData.isPublic !== undefined ? listData.isPublic : userLists[listIndex].isPublic,
      tags: listData.tags !== undefined ? listData.tags : userLists[listIndex].tags,
      items: listData.items !== undefined ? listData.items : userLists[listIndex].items,
      updatedAt: new Date().toISOString()
    };
    
    // Update in users array
    const updatedUsers = [...users];
    updatedUsers[userIndex].customLists[listIndex] = updatedList;
    setUsers(updatedUsers);
    
    // Update in currentUser if it's their list
    if (currentUser.id === updatedList.userId) {
      const currentUserLists = [...(currentUser.customLists || [])];
      const currentUserListIndex = currentUserLists.findIndex(l => l.id === listId);
      
      if (currentUserListIndex !== -1) {
        currentUserLists[currentUserListIndex] = updatedList;
        
        const updatedUser = { ...currentUser, customLists: currentUserLists };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }
    
    return { success: true, list: updatedList };
  };
  
  // Delete a list
  const deleteList = (listId) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Utilizador não encontrado' };
    
    // Find list in user's lists
    const userLists = users[userIndex].customLists || [];
    const listIndex = userLists.findIndex(list => list.id === listId);
    
    // Check if list exists and user has permission
    if (listIndex === -1) {
      return { success: false, message: 'Lista não encontrada' };
    }
    
    if (userLists[listIndex].userId !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, message: 'Você não tem permissão para excluir esta lista' };
    }
    
    // Delete list
    const updatedUsers = [...users];
    updatedUsers[userIndex].customLists.splice(listIndex, 1);
    setUsers(updatedUsers);
    
    // Update currentUser if it's their list
    if (currentUser.id === userLists[listIndex].userId) {
      const updatedUser = { 
        ...currentUser, 
        customLists: (currentUser.customLists || []).filter(list => list.id !== listId) 
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    return { success: true, message: 'Lista excluída com sucesso' };
  };
  
  // Add item to a list
  const addToList = (listId, mediaItem) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    // Find user who owns the list
    let listOwnerIndex = -1;
    let listIndex = -1;
    
    for (let i = 0; i < users.length; i++) {
      const userLists = users[i].customLists || [];
      const index = userLists.findIndex(list => list.id === listId);
      
      if (index !== -1) {
        listOwnerIndex = i;
        listIndex = index;
        break;
      }
    }
    
    if (listOwnerIndex === -1 || listIndex === -1) {
      return { success: false, message: 'Lista não encontrada' };
    }
    
    // Check permission
    const list = users[listOwnerIndex].customLists[listIndex];
    if (list.userId !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, message: 'Você não tem permissão para adicionar itens a esta lista' };
    }
    
    // Check if item already exists in the list
    const isDuplicate = list.items.some(item => 
      item.id === mediaItem.id && 
      ((item.media_type && mediaItem.media_type && item.media_type === mediaItem.media_type) || 
       (!item.media_type && mediaItem.media_type === 'movie') ||
       (!mediaItem.media_type && item.media_type === 'movie'))
    );
    
    if (isDuplicate) {
      return { success: false, message: 'Este item já está na lista' };
    }
    
    // Ensure media_type is set
    const itemToAdd = {
      ...mediaItem,
      media_type: mediaItem.media_type || 'movie' // Default to movie if not specified
    };
    
    // Add item to list
    const updatedUsers = [...users];
    updatedUsers[listOwnerIndex].customLists[listIndex].items.push(itemToAdd);
    updatedUsers[listOwnerIndex].customLists[listIndex].updatedAt = new Date().toISOString();
    setUsers(updatedUsers);
    
    // Update currentUser if it's their list
    if (currentUser.id === list.userId) {
      const currentUserLists = [...(currentUser.customLists || [])];
      const currentUserListIndex = currentUserLists.findIndex(l => l.id === listId);
      
      if (currentUserListIndex !== -1) {
        currentUserLists[currentUserListIndex].items.push(itemToAdd);
        currentUserLists[currentUserListIndex].updatedAt = new Date().toISOString();
        
        const updatedUser = { ...currentUser, customLists: currentUserLists };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }
    
    return { success: true, message: 'Item adicionado à lista' };
  };
  
  // Remove item from a list
  const removeFromList = (listId, mediaId) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    // Find user who owns the list
    let listOwnerIndex = -1;
    let listIndex = -1;
    
    for (let i = 0; i < users.length; i++) {
      const userLists = users[i].customLists || [];
      const index = userLists.findIndex(list => list.id === listId);
      
      if (index !== -1) {
        listOwnerIndex = i;
        listIndex = index;
        break;
      }
    }
    
    if (listOwnerIndex === -1 || listIndex === -1) {
      return { success: false, message: 'Lista não encontrada' };
    }
    
    // Check permission
    const list = users[listOwnerIndex].customLists[listIndex];
    if (list.userId !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, message: 'Você não tem permissão para remover itens desta lista' };
    }
    
    // Remove item from list
    const updatedUsers = [...users];
    // Primeiro, encontramos o item específico a ser removido
    const itemToRemove = list.items.find(item => item.id === mediaId);
    
    if (itemToRemove) {
      // Removemos apenas o item específico com o mesmo ID e tipo de mídia
      updatedUsers[listOwnerIndex].customLists[listIndex].items = list.items.filter(
        item => !(item.id === mediaId && item.media_type === itemToRemove.media_type)
      );
      updatedUsers[listOwnerIndex].customLists[listIndex].updatedAt = new Date().toISOString();
      setUsers(updatedUsers);
    } else {
      // Fallback para o comportamento anterior se não encontrar o item específico
      updatedUsers[listOwnerIndex].customLists[listIndex].items = list.items.filter(
        item => item.id !== mediaId
      );
      updatedUsers[listOwnerIndex].customLists[listIndex].updatedAt = new Date().toISOString();
      setUsers(updatedUsers);
    }
    
    // Update currentUser if it's their list
    if (currentUser.id === list.userId) {
      const currentUserLists = [...(currentUser.customLists || [])];
      const currentUserListIndex = currentUserLists.findIndex(l => l.id === listId);
      
      if (currentUserListIndex !== -1) {
        if (itemToRemove) {
          // Usamos a mesma lógica para o currentUser
          currentUserLists[currentUserListIndex].items = currentUserLists[currentUserListIndex].items.filter(
            item => !(item.id === mediaId && item.media_type === itemToRemove.media_type)
          );
        } else {
          // Fallback para o comportamento anterior
          currentUserLists[currentUserListIndex].items = currentUserLists[currentUserListIndex].items.filter(
            item => item.id !== mediaId
          );
        }
        currentUserLists[currentUserListIndex].updatedAt = new Date().toISOString();
        
        const updatedUser = { ...currentUser, customLists: currentUserLists };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }
    
    return { success: true, message: 'Item removido da lista' };
  };
  
  // Get user's lists
  const getUserLists = (userId = null) => {
    const targetUserId = userId || (currentUser ? currentUser.id : null);
    
    if (!targetUserId) {
      return [];
    }
    
    const userIndex = users.findIndex(u => u.id === targetUserId);
    if (userIndex === -1) {
      return [];
    }
    
    return users[userIndex].customLists || [];
  };
  
  // Get public lists
  const getPublicLists = () => {
    return users
      .flatMap(user => (user.customLists || [])
        .filter(list => list.isPublic)
        .map(list => ({
          ...list,
          username: user.username,
          userName: user.name
        }))
      );
  };
  
  // Get all lists (public and private) - for admin only
  const getAllLists = () => {
    if (currentUser && currentUser.role === 'admin') {
      return users
        .flatMap(user => (user.customLists || [])
          .map(list => ({
            ...list,
            username: user.username,
            userName: user.name
          }))
        );
    } else {
      // Para utilizadores não-admin, retornar apenas listas públicas
      return getPublicLists();
    }
  };
  
  // Get featured lists
  const getFeaturedLists = () => {
    // Verificar se existe a propriedade featuredLists no localStorage
    const featuredListsIds = localStorage.getItem('featuredLists');
    const officialLists = localStorage.getItem('officialLists');
    
    let featuredLists = [];
    
    // Adicionar listas em destaque
    if (featuredListsIds) {
      const ids = JSON.parse(featuredListsIds);
      const publicLists = getPublicLists();
      
      ids.forEach(id => {
        const list = publicLists.find(list => list.id === id);
        if (list) {
          featuredLists.push(list);
        }
      });
    }
    
    // Adicionar listas oficiais
    if (officialLists) {
      const official = JSON.parse(officialLists);
      featuredLists = [...featuredLists, ...official];
    }
    
    return featuredLists;
  };
  
  // Get lists for featuring (admin only)
  const getListsForFeaturing = () => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    const publicLists = getPublicLists();
    const featuredListsIds = localStorage.getItem('featuredLists');
    const ids = featuredListsIds ? JSON.parse(featuredListsIds) : [];
    
    // Marcar as listas que já estão em destaque
    const lists = publicLists.map(list => ({
      ...list,
      isFeatured: ids.includes(list.id)
    }));
    
    return { success: true, lists };
  };
  
  // Add list to featured (admin only)
  const addToFeatured = (listId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    // Verificar se a lista existe e é pública
    const publicLists = getPublicLists();
    const list = publicLists.find(list => list.id === listId);
    
    if (!list) {
      return { success: false, message: 'Lista não encontrada ou não é pública' };
    }
    
    // Adicionar à lista de destaques
    const featuredListsIds = localStorage.getItem('featuredLists');
    const ids = featuredListsIds ? JSON.parse(featuredListsIds) : [];
    
    if (ids.includes(listId)) {
      return { success: false, message: 'Esta lista já está em destaque' };
    }
    
    ids.push(listId);
    localStorage.setItem('featuredLists', JSON.stringify(ids));
    
    return { success: true, message: 'Lista adicionada aos destaques' };
  };
  
  // Remove list from featured (admin only)
  const removeFromFeatured = (listId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    // Remover da lista de destaques
    const featuredListsIds = localStorage.getItem('featuredLists');
    
    if (!featuredListsIds) {
      return { success: false, message: 'Não há listas em destaque' };
    }
    
    const ids = JSON.parse(featuredListsIds);
    
    if (!ids.includes(listId)) {
      return { success: false, message: 'Esta lista não está em destaque' };
    }
    
    const updatedIds = ids.filter(id => id !== listId);
    localStorage.setItem('featuredLists', JSON.stringify(updatedIds));
    
    return { success: true, message: 'Lista removida dos destaques' };
  };
  
  // Create official list (admin only)
  const createOfficialList = (listData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    const newList = {
      id: Date.now(),
      name: listData.name,
      description: listData.description || '',
      coverImage: listData.coverImage,
      isOfficial: true,
      tags: listData.tags || [],
      items: listData.items || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Adicionar à lista de listas oficiais
    const officialLists = localStorage.getItem('officialLists');
    const lists = officialLists ? JSON.parse(officialLists) : [];
    
    lists.push(newList);
    localStorage.setItem('officialLists', JSON.stringify(lists));
    
    return { success: true, list: newList };
  };
  
  // Update official list (admin only)
  const updateOfficialList = (listId, listData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    // Buscar listas oficiais
    const officialLists = localStorage.getItem('officialLists');
    
    if (!officialLists) {
      return { success: false, message: 'Não há listas oficiais' };
    }
    
    const lists = JSON.parse(officialLists);
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) {
      return { success: false, message: 'Lista oficial não encontrada' };
    }
    
    // Atualizar lista
    lists[listIndex] = {
      ...lists[listIndex],
      name: listData.name !== undefined ? listData.name : lists[listIndex].name,
      description: listData.description !== undefined ? listData.description : lists[listIndex].description,
      coverImage: listData.coverImage !== undefined ? listData.coverImage : lists[listIndex].coverImage,
      tags: listData.tags !== undefined ? listData.tags : lists[listIndex].tags,
      items: listData.items !== undefined ? listData.items : lists[listIndex].items,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('officialLists', JSON.stringify(lists));
    
    return { success: true, list: lists[listIndex] };
  };
  
  // Delete official list (admin only)
  const deleteOfficialList = (listId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    // Buscar listas oficiais
    const officialLists = localStorage.getItem('officialLists');
    
    if (!officialLists) {
      return { success: false, message: 'Não há listas oficiais' };
    }
    
    const lists = JSON.parse(officialLists);
    const updatedLists = lists.filter(list => list.id !== listId);
    
    if (updatedLists.length === lists.length) {
      return { success: false, message: 'Lista oficial não encontrada' };
    }
    
    localStorage.setItem('officialLists', JSON.stringify(updatedLists));
    
    return { success: true, message: 'Lista oficial excluída com sucesso' };
  };
  
  // Share list with another user
  const shareList = (listId, targetUsername) => {
    if (!currentUser) return { success: false, message: 'Utilizador não está logado' };
    
    // Find the list
    const listOwnerIndex = users.findIndex(
      u => u.customLists && u.customLists.some(list => list.id === listId)
    );
    
    if (listOwnerIndex === -1) {
      return { success: false, message: 'Lista não encontrada' };
    }
    
    const userLists = users[listOwnerIndex].customLists;
    const listIndex = userLists.findIndex(list => list.id === listId);
    const list = userLists[listIndex];
    
    // Check if current user is the owner or admin
    if (list.userId !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, message: 'Você não tem permissão para compartilhar esta lista' };
    }
    
    // Find target user
    const targetUserIndex = users.findIndex(u => u.username === targetUsername);
    
    if (targetUserIndex === -1) {
      return { success: false, message: 'Utilizador de destino não encontrado' };
    }
    
    if (targetUserIndex === listOwnerIndex) {
      return { success: false, message: 'Você não pode compartilhar uma lista com você mesmo' };
    }
    
    // Create a copy of the list for the target user
    const sharedList = {
      id: Date.now(),
      userId: users[targetUserIndex].id,
      name: `${list.name} (Compartilhado por ${users[listOwnerIndex].username})`,
      description: list.description,
      isPublic: false,
      tags: list.tags,
      items: list.items,
      sharedFrom: {
        userId: list.userId,
        username: users[listOwnerIndex].username,
        listId: list.id
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the shared list to the target user's lists
    const updatedUsers = [...users];
    if (!updatedUsers[targetUserIndex].customLists) {
      updatedUsers[targetUserIndex].customLists = [];
    }
    updatedUsers[targetUserIndex].customLists.push(sharedList);
    setUsers(updatedUsers);
    
    return { 
      success: true, 
      message: `Lista compartilhada com ${targetUsername}` 
    };
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    addToWatchlist,
    removeFromWatchlist,
    searchMedia,
    addComment,
    editComment,
    removeComment,
    getMediaComments,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    deleteUser,
    getAllUsers,
    // Rating system
    rateMedia,
    getUserRating,
    deleteRating,
    getAverageRating,
    // Custom lists
    createList,
    updateList,
    deleteList,
    addToList,
    removeFromList,
    getUserLists,
    getPublicLists,
    shareList,
    // Featured lists
    getFeaturedLists,
    getListsForFeaturing,
    addToFeatured,
    removeFromFeatured,
    getAllLists,
    // Official lists
    createOfficialList,
    updateOfficialList,
    deleteOfficialList
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 