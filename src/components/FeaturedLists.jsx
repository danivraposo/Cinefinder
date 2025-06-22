import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaStar, FaChevronRight, FaTag, FaUser, FaFilm, FaPlus, FaMinus, FaSearch, FaFilter } from 'react-icons/fa';
import './FeaturedLists.css';

const FeaturedLists = ({ isAdminMode = false }) => {
  const { getFeaturedLists, getAllLists, getListsForFeaturing, addToFeatured, removeFromFeatured, currentUser } = useAuth();
  const [featuredLists, setFeaturedLists] = useState([]);
  const [availableLists, setAvailableLists] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'featured', 'notFeatured'
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (currentUser && currentUser.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    if (isAdminMode) {
      // Load all lists for administration mode
      const result = getListsForFeaturing();
      if (result.success) {
        setAvailableLists(result.lists);
        const featured = result.lists.filter(list => list.isFeatured);
        setFeaturedLists(featured);
      }
    } else {
      // Load only featured lists for normal mode
      const lists = getFeaturedLists();
      
      // Transform IDs into complete list objects
      if (Array.isArray(lists)) {
        // If getFeaturedLists returned a list of IDs
        const allLists = getAllLists();
        const fullLists = lists
          .map(listId => allLists.find(list => list.id === listId))
          .filter(list => list); // Remove undefined
        setFeaturedLists(fullLists);
      } else {
        // If getFeaturedLists already returned complete objects
        setFeaturedLists(lists);
      }
    }
  }, [getFeaturedLists, getAllLists, getListsForFeaturing, currentUser, isAdminMode]);

  const handleViewList = (listId) => {
    navigate(`/list/${listId}`);
  };

  const handleAddToFeatured = (listId) => {
    const result = addToFeatured(listId);
    if (result.success) {
      // Update UI
      setAvailableLists(prevLists => 
        prevLists.map(list => 
          list.id === listId ? { ...list, isFeatured: true } : list
        )
      );
      
      // Add to featured list
      const listToAdd = availableLists.find(list => list.id === listId);
      if (listToAdd) {
        setFeaturedLists(prev => [...prev, { ...listToAdd, isFeatured: true }]);
      }
      
      setMessage({ text: 'List successfully added to featured!', type: 'success' });
    } else {
      setMessage({ text: result.message || 'Error adding list to featured', type: 'error' });
    }
    
    // Clear message after a few seconds
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleRemoveFromFeatured = (listId) => {
    const result = removeFromFeatured(listId);
    if (result.success) {
      // Update UI
      setAvailableLists(prevLists => 
        prevLists.map(list => 
          list.id === listId ? { ...list, isFeatured: false } : list
        )
      );
      
      // Remove from featured list
      setFeaturedLists(prev => prev.filter(list => list.id !== listId));
      
      setMessage({ text: 'List successfully removed from featured!', type: 'success' });
    } else {
      setMessage({ text: result.message || 'Error removing list from featured', type: 'error' });
    }
    
    // Clear message after a few seconds
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Function to get the list cover image URL
  const getListCoverImage = (list) => {
    if (list.items && list.items.length > 0) {
      const firstItem = list.items[0];
      if (firstItem.poster_path) {
        return `https://image.tmdb.org/t/p/w500${firstItem.poster_path}`;
      }
    }
    return null;
  };

  // Function to create a thumbnail with multiple images
  const renderListThumbnail = (list) => {
    if (!list.items || list.items.length === 0) {
      return <div className="empty-thumbnail">No items</div>;
    }

    // Take up to 4 items to show in the thumbnail
    const thumbnailItems = list.items.slice(0, 4);
    
    return (
      <div className="list-thumbnail">
        {thumbnailItems.map((item, index) => (
          <div key={index} className="thumbnail-item">
            {item.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} 
                alt={item.title || item.name} 
              />
            ) : (
              <div className="no-poster">
                <span>{item.title || item.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Extract all unique tags from lists
  const getUniqueTags = (lists) => {
    return [...new Set(
      lists
        .flatMap(list => list.tags || [])
        .filter(tag => tag) // Remove empty tags
    )];
  };

  const allTags = isAdminMode 
    ? getUniqueTags(availableLists)
    : getUniqueTags(featuredLists);

  // Filter lists based on criteria
  const filterLists = (lists) => {
    // First filter by category
    let filtered = selectedCategory
      ? lists.filter(list => list.tags && list.tags.includes(selectedCategory))
      : lists;
    
    // Then filter by text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(list => 
        (list.name && list.name.toLowerCase().includes(query)) ||
        (list.description && list.description.toLowerCase().includes(query)) ||
        (list.tags && list.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Finally, filter by featured status (only in admin mode)
    if (isAdminMode) {
      if (filterMode === 'featured') {
        filtered = filtered.filter(list => list.isFeatured);
      } else if (filterMode === 'notFeatured') {
        filtered = filtered.filter(list => !list.isFeatured);
      }
    }
    
    return filtered;
  };

  const filteredLists = isAdminMode
    ? filterLists(availableLists)
    : filterLists(featuredLists);

  return (
    <div className="featured-lists-container">
      <div className="featured-lists-header">
        <h2>{isAdminMode ? 'Manage Featured Lists' : 'Featured Lists'}</h2>
        {isAdminMode && isAdmin ? (
          <div className="admin-controls">
            <div className="search-filter-container">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search lists..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-dropdown">
                <FaFilter className="filter-icon" />
                <select 
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                >
                  <option value="all">All lists</option>
                  <option value="featured">Featured</option>
                  <option value="notFeatured">Not featured</option>
                </select>
              </div>
            </div>
            {message.text && (
              <div className={`admin-message ${message.type}`}>
                {message.text}
              </div>
            )}
          </div>
        ) : isAdmin && !isAdminMode ? (
          <div className="featured-actions">
            <button 
              className="manage-featured-button"
              onClick={() => navigate('/admin/featured-lists')}
            >
              Manage Featured Lists
            </button>
          </div>
        ) : null}
      </div>

      {allTags.length > 0 && (
        <div className="featured-categories">
          <button 
            className={`category-button ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {allTags.map((tag, index) => (
            <button 
              key={index}
              className={`category-button ${selectedCategory === tag ? 'active' : ''}`}
              onClick={() => setSelectedCategory(tag)}
            >
              <FaTag className="category-icon" /> {tag}
            </button>
          ))}
        </div>
      )}
      
      {filteredLists.length === 0 ? (
        <div className="empty-featured">
          <p>
            {isAdminMode
              ? 'No lists found with current filters.'
              : selectedCategory 
                ? `No featured lists in the "${selectedCategory}" category.` 
                : 'No featured lists at the moment.'}
          </p>
        </div>
      ) : (
        <div className="featured-lists-grid">
          {filteredLists.map(list => (
            <div 
              key={list.id} 
              className={`featured-list-card ${isAdminMode && list.isFeatured ? 'is-featured' : ''}`}
              onClick={isAdminMode ? undefined : () => handleViewList(list.id)}
            >
              {renderListThumbnail(list)}
              
              <div className="featured-list-info">
                <h3>{list.name}</h3>
                
                {list.tags && list.tags.length > 0 && (
                  <div className="list-tags">
                    {list.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="list-tag">
                        <FaTag className="tag-icon" /> {tag}
                      </span>
                    ))}
                    {list.tags.length > 3 && (
                      <span className="more-tags">+{list.tags.length - 3}</span>
                    )}
                  </div>
                )}
                
                <p className="list-description">{list.description || 'No description'}</p>
                
                <div className="list-meta">
                  <span className="list-author">
                    <FaUser className="meta-icon" /> {list.username}
                  </span>
                  <span className="list-count">
                    <FaFilm className="meta-icon" /> {list.items ? list.items.length : 0} items
                  </span>
                </div>
                
                {isAdminMode ? (
                  <div className="admin-list-actions">
                    {list.isFeatured ? (
                      <button 
                        className="remove-featured-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFeatured(list.id);
                        }}
                      >
                        <FaMinus /> Remove from featured
                      </button>
                    ) : (
                      <button 
                        className="add-featured-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToFeatured(list.id);
                        }}
                      >
                        <FaPlus /> Add to featured
                      </button>
                    )}
                    <button 
                      className="view-list-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewList(list.id);
                      }}
                    >
                      View List <FaChevronRight />
                    </button>
                  </div>
                ) : (
                  <button className="view-list-button">
                    View List <FaChevronRight />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isAdminMode && (
        <div className="see-more-container">
          <button 
            className="see-more-button"
            onClick={() => navigate('/lists')}
          >
            View all public lists
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedLists; 