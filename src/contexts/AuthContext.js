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
    comments: []
  },
  {
    id: 2,
    username: 'jose',
    password: 'admin123',
    name: 'José',
    role: 'admin',
    watchlist: [],
    comments: []
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
    if (!currentUser) return { success: false, message: 'Usuário não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Usuário não encontrado' };
    
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
    if (!currentUser) return { success: false, message: 'Usuário não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Usuário não encontrado' };
    
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

  // Adicionar comentário
  const addComment = (mediaId, mediaType, commentText) => {
    if (!currentUser) return { success: false, message: 'Usuário não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Usuário não encontrado' };
    
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
    if (!currentUser) return { success: false, message: 'Usuário não está logado' };
    
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: 'Usuário não encontrado' };
    
    const commentIndex = users[userIndex].comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return { success: false, message: 'Comentário não encontrado' };
    
    // Verificar se o usuário é dono do comentário ou é admin
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
    if (!currentUser) return { success: false, message: 'Usuário não está logado' };
    
    // Verificar se é o dono do comentário ou admin
    const isAdmin = currentUser.role === 'admin';
    const isOwner = currentUser.id === userId;
    
    if (!isAdmin && !isOwner) {
      return { success: false, message: 'Você não tem permissão para remover este comentário' };
    }
    
    // Encontrar usuário que fez o comentário
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Usuário não encontrado' };
    
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
      return { success: false, message: 'Este nome de usuário já está em uso' };
    }
    
    const newUser = {
      id: Date.now(),
      ...userData,
      watchlist: [],
      comments: []
    };
    
    setUsers([...users, newUser]);
    return { success: true, user: newUser };
  };

  const updateUser = (userId, userData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Usuário não encontrado' };
    
    // Verificar se está tentando alterar o username para um que já existe
    if (userData.username && userData.username !== users[userIndex].username) {
      const usernameExists = users.some(u => u.username === userData.username && u.id !== userId);
      if (usernameExists) {
        return { success: false, message: 'Este nome de usuário já está em uso' };
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
    if (userIndex === -1) return { success: false, message: 'Usuário não encontrado' };
    
    const updatedUsers = [...users];
    updatedUsers[userIndex].active = false;
    setUsers(updatedUsers);
    
    return { success: true, message: 'Usuário desativado com sucesso' };
  };

  // Reativar usuário (apenas admin pode reativar)
  const activateUser = (userId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Usuário não encontrado' };
    
    const updatedUsers = [...users];
    updatedUsers[userIndex].active = true;
    setUsers(updatedUsers);
    
    return { success: true, message: 'Usuário reativado com sucesso' };
  };

  // Excluir usuário (apenas admin pode excluir)
  const deleteUser = (userId) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }

    // Verificar se está tentando excluir um dos usuários pré-definidos
    if (userId === 1 || userId === 2) {
      return { success: false, message: 'Não é possível excluir usuários pré-definidos do sistema' };
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Usuário não encontrado' };
    
    // Excluir o usuário
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    
    return { success: true, message: 'Usuário excluído com sucesso' };
  };

  // Obter todos os comentários de um filme/série
  const getMediaComments = (mediaId) => {
    // Coletar todos os comentários de todos os usuários para o mediaId específico
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

  // Obter todos os usuários (apenas para admin)
  const getAllUsers = () => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Permissão negada' };
    }
    
    return { success: true, users: users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    })};
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    addToWatchlist,
    removeFromWatchlist,
    addComment,
    editComment,
    removeComment,
    getMediaComments,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    deleteUser,
    getAllUsers
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 