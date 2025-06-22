import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaCheck, FaTrash, FaFilter, FaSearch, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
import './ModerationPanel.css';

const ModerationPanel = () => {
  const { currentUser, getContentForModeration, approveContent, removeContent, notifyUser } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'reviews', 'comments'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'flags'
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    // Fetch content that needs moderation
    const fetchContent = async () => {
      try {
        const result = await getContentForModeration();
        if (result.success) {
          setContent(result.content);
        } else {
          setError(result.message || 'Failed to fetch content for moderation');
        }
      } catch (err) {
        setError('An error occurred while fetching moderation content');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [currentUser, getContentForModeration]);

  const handleApprove = async (contentId) => {
    try {
      const result = await approveContent(contentId);
      if (result.success) {
        // Remove the approved content from the list
        setContent(prevContent => prevContent.filter(item => item.id !== contentId));
        showNotification('Content approved successfully', 'success');
      } else {
        showNotification(result.message || 'Failed to approve content', 'error');
      }
    } catch (err) {
      showNotification('An error occurred while approving content', 'error');
      console.error(err);
    }
  };

  const handleRemove = async (contentId) => {
    try {
      const result = await removeContent(contentId);
      if (result.success) {
        // Remove the content from the list
        setContent(prevContent => prevContent.filter(item => item.id !== contentId));
        showNotification('Content removed successfully', 'success');
      } else {
        showNotification(result.message || 'Failed to remove content', 'error');
      }
    } catch (err) {
      showNotification('An error occurred while removing content', 'error');
      console.error(err);
    }
  };

  const handleNotifyUser = async (userId, contentId, reason) => {
    try {
      const result = await notifyUser(userId, contentId, reason);
      if (result.success) {
        showNotification('User notification sent successfully', 'success');
      } else {
        showNotification(result.message || 'Failed to send notification', 'error');
      }
    } catch (err) {
      showNotification('An error occurred while sending notification', 'error');
      console.error(err);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Filter and sort content
  const filteredContent = content
    .filter(item => {
      // Filter by type
      if (filter !== 'all' && item.type !== filter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (item.content && item.content.toLowerCase().includes(searchLower)) ||
          (item.username && item.username.toLowerCase().includes(searchLower)) ||
          (item.title && item.title.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (sortBy === 'flags') {
        return (b.flags || 0) - (a.flags || 0);
      } else {
        // Default sort by date
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  if (loading) {
    return <div className="moderation-loading">Loading moderation panel...</div>;
  }

  if (error) {
    return <div className="moderation-error">{error}</div>;
  }

  return (
    <div className="moderation-panel">
      <h1>Content Moderation Panel</h1>
      
      {notification.show && (
        <div className={`moderation-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="moderation-controls">
        <div className="filter-control">
          <FaFilter className="control-icon" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All content</option>
            <option value="review">Reviews</option>
            <option value="comment">Comments</option>
          </select>
        </div>
        
        <div className="search-control">
          <FaSearch className="control-icon" />
          <input 
            type="text" 
            placeholder="Search content..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sort-control">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by date</option>
            <option value="flags">Sort by flags</option>
          </select>
        </div>
      </div>
      
      <div className="moderation-stats">
        <div className="stat-item">
          <span className="stat-label">Total items:</span>
          <span className="stat-value">{content.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Reviews:</span>
          <span className="stat-value">{content.filter(item => item.type === 'review').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Comments:</span>
          <span className="stat-value">{content.filter(item => item.type === 'comment').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Flagged items:</span>
          <span className="stat-value">{content.filter(item => item.flags && item.flags > 0).length}</span>
        </div>
      </div>
      
      {filteredContent.length === 0 ? (
        <div className="no-content">
          <p>No content to moderate with the current filters.</p>
        </div>
      ) : (
        <div className="content-list">
          {filteredContent.map(item => (
            <div key={item.id} className={`content-item ${item.flags > 0 ? 'flagged' : ''}`}>
              <div className="content-header">
                <span className="content-type">{item.type === 'review' ? 'Review' : 'Comment'}</span>
                <span className="content-date">
                  {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                </span>
                {item.flags > 0 && (
                  <span className="content-flags">
                    <FaExclamationTriangle className="flag-icon" /> {item.flags} flags
                  </span>
                )}
              </div>
              
              <div className="content-body">
                {item.type === 'review' && item.title && (
                  <h3 className="content-title">{item.title}</h3>
                )}
                
                <p className="content-text">{item.content}</p>
                
                <div className="content-meta">
                  <span className="content-user">By: {item.username}</span>
                  {item.mediaTitle && (
                    <span className="content-media">
                      On: {item.mediaTitle} ({item.mediaType === 'movie' ? 'Movie' : 'TV Show'})
                    </span>
                  )}
                </div>
              </div>
              
              <div className="content-actions">
                <button 
                  className="approve-button"
                  onClick={() => handleApprove(item.id)}
                >
                  <FaCheck /> Approve
                </button>
                <button 
                  className="remove-button"
                  onClick={() => handleRemove(item.id)}
                >
                  <FaTrash /> Remove
                </button>
                <button 
                  className="notify-button"
                  onClick={() => handleNotifyUser(
                    item.userId, 
                    item.id, 
                    'Your content has been flagged for review'
                  )}
                >
                  <FaEnvelope /> Notify User
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;