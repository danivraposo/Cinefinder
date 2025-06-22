import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit, FaEye, FaPlus, FaTimes, FaTag, FaSave, FaLock, FaGlobe, FaShare, FaFilm, FaTv } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './CustomList.css';

const CustomList = ({ list, onUpdate, mode = 'view' }) => {
  const [editMode, setEditMode] = useState(mode === 'edit');
  const [listName, setListName] = useState(list?.name || '');
  const [listDescription, setListDescription] = useState(list?.description || '');
  const [isPublic, setIsPublic] = useState(list?.isPublic !== false);
  const [tags, setTags] = useState(list?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [items, setItems] = useState(list?.items || []);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, searchMedia, createList, updateList, deleteList, deleteListItem } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Update local state if list prop changes
    if (list) {
      setListName(list.name || '');
      setListDescription(list.description || '');
      setIsPublic(list.isPublic !== false);
      setTags(list.tags || []);
      setItems(list.items || []);
    }
  }, [list]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setError('');
      
      const result = await searchMedia(searchQuery, searchType);
      
      if (result.success) {
        // Filter out items that are already in the list
        const existingIds = items.map(item => item.id);
        const filteredResults = result.results.filter(item => !existingIds.includes(item.id));
        setSearchResults(filteredResults);
      } else {
        setError(result.message || 'Search failed');
      }
    } catch (err) {
      setError('An error occurred during search');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddItem = (item) => {
    // Add media type to the item
    const itemWithType = {
      ...item,
      media_type: searchType
    };
    
    // Add to list items
    setItems([...items, itemWithType]);
    
    // Remove from search results
    setSearchResults(searchResults.filter(result => result.id !== item.id));
  };

  const handleRemoveItem = async (itemId) => {
    if (list && list.id) {
      try {
        const result = await deleteListItem(list.id, itemId);
        if (result.success) {
          setItems(items.filter(item => item.id !== itemId));
        } else {
          setError(result.message || 'Failed to remove item');
        }
      } catch (err) {
        setError('An error occurred while removing item');
        console.error(err);
      }
    } else {
      // For new lists or local operations
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Check if tag already exists
    if (tags.includes(tagInput.trim())) {
      setError('Tag already exists');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!listName.trim()) {
      setError('List name is required');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      let result;
      
      if (list && list.id) {
        // Update existing list
        result = await updateList(list.id, {
          name: listName,
          description: listDescription,
          isPublic,
          tags,
          items
        });
      } else {
        // Create new list
        result = await createList({
          name: listName,
          description: listDescription,
          isPublic,
          tags,
          items
        });
      }
      
      if (result.success) {
        if (onUpdate) {
          onUpdate(result.list);
        }
        
        if (!list || !list.id) {
          // Navigate to the new list
          navigate(`/list/${result.list.id}`);
        } else {
          setEditMode(false);
        }
      } else {
        setError(result.message || 'Failed to save list');
      }
    } catch (err) {
      setError('An error occurred while saving the list');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!list || !list.id) return;
    
    if (!window.confirm('Are you sure you want to delete this list?')) {
      return;
    }
    
    try {
      const result = await deleteList(list.id);
      
      if (result.success) {
        navigate('/profile');
      } else {
        setError(result.message || 'Failed to delete list');
      }
    } catch (err) {
      setError('An error occurred while deleting the list');
      console.error(err);
    }
  };

  const handleShare = () => {
    if (!list || !list.id || !isPublic) return;
    
    const listUrl = `${window.location.origin}/list/${list.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(listUrl)
      .then(() => {
        alert('List URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
        // Fallback
        prompt('Copy this link to share your list:', listUrl);
      });
  };

  if (!currentUser && mode === 'edit') {
    return <div className="custom-list-error">You must be logged in to create or edit lists.</div>;
  }

  if (list && list.userId !== currentUser?.id && mode === 'edit' && currentUser?.role !== 'admin') {
    return <div className="custom-list-error">You don't have permission to edit this list.</div>;
  }

  return (
    <div className="custom-list">
      {error && <div className="list-error">{error}</div>}
      
      {editMode ? (
        <div className="list-edit-mode">
          <div className="list-header-edit">
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="List name"
              className="list-name-input"
            />
            
            <div className="list-privacy-toggle">
              <button 
                className={`privacy-button ${isPublic ? 'active' : ''}`}
                onClick={() => setIsPublic(true)}
              >
                <FaGlobe /> Public
              </button>
              <button 
                className={`privacy-button ${!isPublic ? 'active' : ''}`}
                onClick={() => setIsPublic(false)}
              >
                <FaLock /> Private
              </button>
            </div>
          </div>
          
          <textarea
            value={listDescription}
            onChange={(e) => setListDescription(e.target.value)}
            placeholder="List description (optional)"
            className="list-description-input"
            rows="3"
          />
          
          <div className="list-tags-editor">
            <h3>Tags</h3>
            <div className="add-tag-form">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button onClick={handleAddTag}>Add</button>
            </div>
            
            <div className="tags-list">
              {tags.map((tag, index) => (
                <div key={index} className="tag-item">
                  <FaTag /> {tag}
                  <button onClick={() => handleRemoveTag(tag)}>
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="list-items-editor">
            <h3>Items ({items.length})</h3>
            
            <div className="search-media-form">
              <div className="search-inputs">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for movies or TV shows"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="movie">Movies</option>
                  <option value="tv">TV Shows</option>
                </select>
              </div>
              <button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                <h4>Search Results</h4>
                <div className="results-grid">
                  {searchResults.map(item => (
                    <div key={item.id} className="search-result-item">
                      <div className="result-poster">
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
                      <div className="result-info">
                        <h5>{item.title || item.name}</h5>
                        <p>
                          {item.release_date || item.first_air_date 
                            ? new Date(item.release_date || item.first_air_date).getFullYear() 
                            : 'N/A'}
                        </p>
                      </div>
                      <button 
                        className="add-to-list-button"
                        onClick={() => handleAddItem(item)}
                      >
                        <FaPlus /> Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="list-items">
              {items.length > 0 ? (
                <div className="items-grid">
                  {items.map(item => (
                    <div key={item.id} className="list-item">
                      <div className="item-poster">
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
                        <div className="item-type-badge">
                          {item.media_type === 'movie' ? <FaFilm /> : <FaTv />}
                        </div>
                      </div>
                      <div className="item-info">
                        <h5>{item.title || item.name}</h5>
                        <p>
                          {item.release_date || item.first_air_date 
                            ? new Date(item.release_date || item.first_air_date).getFullYear() 
                            : 'N/A'}
                        </p>
                      </div>
                      <button 
                        className="remove-item-button"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-list">
                  <p>No items in this list yet. Use the search above to add movies or TV shows.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="list-actions">
            <button 
              className="save-list-button"
              onClick={handleSave}
            >
              <FaSave /> Save List
            </button>
            
            <button 
              className="cancel-edit-button"
              onClick={() => {
                if (list) {
                  // Reset to original values
                  setListName(list.name || '');
                  setListDescription(list.description || '');
                  setIsPublic(list.isPublic !== false);
                  setTags(list.tags || []);
                  setItems(list.items || []);
                  setEditMode(false);
                } else {
                  // Navigate back for new lists
                  navigate(-1);
                }
              }}
            >
              Cancel
            </button>
            
            {list && list.id && (
              <button 
                className="delete-list-button"
                onClick={handleDelete}
              >
                <FaTrash /> Delete List
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="list-view-mode">
          <div className="list-header">
            <div className="list-title-section">
              <h2>{listName}</h2>
              <span className={`list-privacy-badge ${isPublic ? 'public' : 'private'}`}>
                {isPublic ? <><FaGlobe /> Public</> : <><FaLock /> Private</>}
              </span>
            </div>
            
            {list && currentUser && (list.userId === currentUser.id || currentUser.role === 'admin') && (
              <div className="list-actions">
                <button 
                  className="edit-list-button"
                  onClick={() => setEditMode(true)}
                >
                  <FaEdit /> Edit
                </button>
                
                {isPublic && (
                  <button 
                    className="share-list-button"
                    onClick={handleShare}
                  >
                    <FaShare /> Share
                  </button>
                )}
                
                <button 
                  className="delete-list-button"
                  onClick={handleDelete}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>
          
          {listDescription && (
            <div className="list-description">
              <p>{listDescription}</p>
            </div>
          )}
          
          {tags.length > 0 && (
            <div className="list-tags">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  <FaTag /> {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="list-content">
            <h3>Items ({items.length})</h3>
            
            {items.length > 0 ? (
              <div className="items-grid view-mode">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className="list-item view-mode"
                    onClick={() => navigate(`/${item.media_type}/${item.id}`)}
                  >
                    <div className="item-poster">
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
                      <div className="item-type-badge">
                        {item.media_type === 'movie' ? <FaFilm /> : <FaTv />}
                      </div>
                    </div>
                    <div className="item-info">
                      <h5>{item.title || item.name}</h5>
                      <p>
                        {item.release_date || item.first_air_date 
                          ? new Date(item.release_date || item.first_air_date).getFullYear() 
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="view-item-overlay">
                      <FaEye /> View Details
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-list">
                <p>This list is empty.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomList;