import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './CommentSection.css';

const CommentSection = ({ mediaId, mediaType }) => {
  const { currentUser, addComment, editComment, removeComment, getMediaComments } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  // Carregar comentários
  useEffect(() => {
    if (mediaId) {
      const mediaComments = getMediaComments(mediaId);
      // Filtrar comentários duplicados
      const uniqueComments = mediaComments.filter((comment, index, self) =>
        index === self.findIndex(c => c.id === comment.id)
      );
      setComments(uniqueComments);
    }
  }, [mediaId, getMediaComments]);

  const handleAddComment = (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Você precisa estar logado para comentar.');
      return;
    }
    
    if (!newComment.trim()) {
      alert('O comentário não pode estar vazio.');
      return;
    }
    
    const result = addComment(mediaId, mediaType, newComment);
    
    if (result.success) {
      setNewComment('');
      // Atualizar a lista de comentários
      const updatedComments = getMediaComments(mediaId);
      // Filtrar comentários duplicados
      const uniqueComments = updatedComments.filter((comment, index, self) =>
        index === self.findIndex(c => c.id === comment.id)
      );
      setComments(uniqueComments);
    }
  };

  const handleEdit = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = (commentId) => {
    const result = editComment(commentId, editText);
    
    if (result.success) {
      setEditingComment(null);
      setEditText('');
      // Atualizar a lista de comentários
      const updatedComments = getMediaComments(mediaId);
      // Filtrar comentários duplicados
      const uniqueComments = updatedComments.filter((comment, index, self) =>
        index === self.findIndex(c => c.id === comment.id)
      );
      setComments(uniqueComments);
    } else {
      alert(result.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleDelete = (commentId, userId) => {
    if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
      const result = removeComment(commentId, userId);
      
      if (result.success) {
        // Atualizar a lista de comentários
        const updatedComments = getMediaComments(mediaId);
        // Filtrar comentários duplicados
        const uniqueComments = updatedComments.filter((comment, index, self) =>
          index === self.findIndex(c => c.id === comment.id)
        );
        setComments(uniqueComments);
      } else {
        alert(result.message);
      }
    }
  };

  return (
    <div className="comment-section">
      <h3>Comentários</h3>
      
      {currentUser ? (
        <form className="comment-form" onSubmit={handleAddComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            rows="3"
          />
          <button type="submit" className="submit-comment">
            Comentar
          </button>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Faça login para adicionar um comentário.</p>
        </div>
      )}
      
      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.username}</span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {editingComment === comment.id ? (
                <div className="comment-edit">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows="3"
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleSaveEdit(comment.id)}>Salvar</button>
                    <button onClick={handleCancelEdit}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-text">{comment.text}</p>
                  {currentUser && (currentUser.id === comment.userId || currentUser.role === 'admin') && (
                    <div className="comment-actions">
                      {currentUser.id === comment.userId && (
                        <button onClick={() => handleEdit(comment)}>Editar</button>
                      )}
                      <button onClick={() => handleDelete(comment.id, comment.userId)}>
                        Excluir
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div className="no-comments">
            <p>Ainda não há comentários. Seja o primeiro a comentar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 