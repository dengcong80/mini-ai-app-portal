import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { responsive } from '../utils/responsive';
const DashboardPage = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]); // Store all projects for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [totalProjects, setTotalProjects] = useState(0);
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('appName'); // 'appName', 'createdBy', 'status'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Completed', 'In Process'

  const itemsPerPage = 5;
  // add cache
  const cacheRef = useRef(new Map());
  // Define getStatus function before useMemo
  const getStatus = (project) => {
    return project.mockHtml ? 'Completed' : 'In Process';
  };

  const getStatusStyle = (status) => {
    return {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: status === 'Completed' ? '#d4edda' : '#fff3cd',
      color: status === 'Completed' ? '#155724' : '#856404',
      border: status === 'Completed' ? '1px solid #c3e6cb' : '1px solid #ffeaa7'
    };
  };

  const fetchAllProjects = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      console.log('Fetching projects from:', `${API_BASE_URL}/api/requirements?page=${page}&limit=${itemsPerPage}`);
   
      const res = await axios.get(`${API_BASE_URL}/api/requirements?page=${page}&limit=${itemsPerPage}`);
      console.log('API Response:', res.data);
      const { requirements, totalPages, currentPage, total } = res.data;
      
      // cache data
      const cacheKey = `projects_${page}`;
      cacheRef.current.set(cacheKey, {
        requirements,
        totalPages,
        currentPage,
        total
      });
      
      setProjects(requirements);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);






const fetchWithCache = useCallback(async (page) => {
  const cacheKey = `projects_${page}`;
  if (cacheRef.current.has(cacheKey)) {
    const cached = cacheRef.current.get(cacheKey);
    setProjects(cached.requirements);
    setTotalPages(cached.totalPages);
    setCurrentPage(cached.currentPage);
    setTotalProjects(cached.total); 
    return;
  }
  
  try {
    setLoading(true);
    const res = await axios.get(`${API_BASE_URL}/api/requirements?page=${page}&limit=${itemsPerPage}`);
    const { requirements, totalPages, currentPage, total } = res.data;
    
    // cache data
    const cacheKey = `projects_${page}`;
    cacheRef.current.set(cacheKey, {
      requirements,
      totalPages,
      currentPage,
      total
    });
    
    setProjects(requirements);
    setTotalPages(totalPages);
    setCurrentPage(currentPage);
    setTotalProjects(total); 
  } catch (err) {
    console.error('Failed to fetch projects:', err);
    setError('Failed to load projects');
  } finally {
    setLoading(false);
  }
}, [ itemsPerPage]);

useEffect(() => {
  fetchWithCache(1);
}, [fetchWithCache]);


// add fetch all projects for search
const fetchAllProjectsForSearch = useCallback(async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/requirements?page=1&limit=1000`); // 获取大量数据用于搜索
    setAllProjects(res.data.requirements);
  } catch (err) {
    console.error('Failed to fetch all projects for search:', err);
  }
}, []);

// when search starts, fetch all data
useEffect(() => {
  if (searchTerm.trim()) {
    fetchAllProjectsForSearch();
  }else{
    setAllProjects([]);
  }
}, [searchTerm, fetchAllProjectsForSearch]);

  // Filter and paginate projects based on search
  const filteredProjects = useMemo(() => {
    let filtered = searchTerm.trim() ? allProjects : projects;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(project => {
        const term = searchTerm.toLowerCase();
        
        switch (searchBy) {
          case 'appName':
            return (project.appName || '').toLowerCase().includes(term);
          case 'createdBy':
            const creatorName = project.createdBy?.realName || project.createdBy?.username || 'Unknown User';
            return creatorName.toLowerCase().includes(term);
          case 'status':
            const status = getStatus(project);
            return status.toLowerCase().includes(term);
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => getStatus(project) === statusFilter);
    }

    return filtered;
  }, [projects,allProjects, searchTerm, searchBy, statusFilter]);

 

 
  



  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchWithCache(page); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
    setSearchTerm(''); // Clear search term when changing search type
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchBy('appName');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          style={{
            padding: '8px 12px',
            margin: '0 2px',
            border: '1px solid #dee2e6',
            background: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#495057'
          }}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" style={{ padding: '8px', color: '#6c757d' }}>
            ...
          </span>
        );
      }
    }

    // Add middle page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          style={{
            padding: '8px 12px',
            margin: '0 2px',
            border: '1px solid #dee2e6',
            background: i === currentPage ? '#007bff' : 'white',
            color: i === currentPage ? 'white' : '#495057',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: i === currentPage ? '600' : '400'
          }}
          onMouseOver={(e) => {
            if (i !== currentPage) {
              e.target.style.backgroundColor = '#f8f9fa';
            }
          }}
          onMouseOut={(e) => {
            if (i !== currentPage) {
              e.target.style.backgroundColor = 'white';
            }
          }}
        >
          {i}
        </button>
      );
    }

    // Add ellipsis and last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" style={{ padding: '8px', color: '#6c757d' }}>
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          style={{
            padding: '8px 12px',
            margin: '0 2px',
            border: '1px solid #dee2e6',
            background: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#495057'
          }}
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div style={responsive.pagination}>
        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            border: '1px solid #dee2e6',
            background: currentPage === 1 ? '#f8f9fa' : 'white',
            color: currentPage === 1 ? '#6c757d' : '#495057',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ← Previous
        </button>

        {/* Page numbers */}
        {pages}

        {/* Next page button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 16px',
            border: '1px solid #dee2e6',
            background: currentPage === totalPages ? '#f8f9fa' : 'white',
            color: currentPage === totalPages ? '#6c757d' : '#495057',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          Next →
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2>📊 Public Dashboard</h2>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2>📊 Public Dashboard</h2>
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <p>{error}</p>
          <button
            onClick={fetchAllProjects}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={responsive.container}>
      <div style={{ marginBottom: '30px' }}>
        <h2>📊 Public Dashboard</h2>
        <p style={{ color: '#6c757d', margin: '0' }}>
          Explore all projects created by our community. Click to view RAOS and UI mockups.
        </p>
        <p style={{ color: '#6c757d', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
          Page {currentPage} of {totalPages}  ({totalProjects} projects found )
          {searchTerm && ` • ${filteredProjects.length} matching results`}
        </p>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        ...responsive.card,
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '1.2rem' }}>
          🔍 Search & Filter
        </h3>
        
        <div style={responsive.searchForm}>
          {/* Search Input */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
              Search Term:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={`Search by ${searchBy === 'appName' ? 'app name' : searchBy === 'createdBy' ? 'creator name' : 'status'}...`}
              style={responsive.input}
            />
          </div>

          {/* Search By Dropdown */}
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
              Search By:
            </label>
            <select
              value={searchBy}
              onChange={handleSearchByChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="appName">App Name</option>
              <option value="createdBy">Creator</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '120px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Process">In Process</option>
            </select>
          </div>

          {/* Clear Button */}
          <div>
            <button
              onClick={clearSearch}
              style={{
                padding: '10px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#5a6268';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#6c757d';
              }}
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Search Results Summary */}
        {(searchTerm || statusFilter !== 'all') && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            border: '1px solid #bbdefb'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#1976d2' }}>
              <strong>Search Results:</strong> Found {filteredProjects.length} projects
              {searchTerm && ` matching "${searchTerm}"`}
              {statusFilter !== 'all' && ` with status "${statusFilter}"`}
            </p>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          <p>No projects found matching your search criteria.</p>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid',
  gap: '20px',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  [responsive.mediaQuery('768px')]: {
    gridTemplateColumns: '1fr',
    gap: '15px'
  }
  }}>
            {projects.map(project => {
              const status = getStatus(project);
              return (
                <div
                  key={project._id}
                  style={{
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '15px',
                    [responsive.mediaQuery('480px')]: {
                      flexDirection: 'column',
                      gap: '10px'
                    }
                   }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        color: '#2c3e50',
                        fontSize: '1.3rem',
                        fontWeight: '600'
                      }}>
                        {project.appName || 'Untitled Project'}
                      </h3>
                      <p style={{ 
                        margin: '0 0 10px 0', 
                        color: '#6c757d',
                        lineHeight: '1.5',
                        maxHeight: '120px',
                        overflow: 'auto',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {project.appDescription || 'No description available'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={getStatusStyle(status)}>
                        {status}
                      </span>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {project.createdBy?.avatar || '👤'}
                      </span>
                      <div>
                        <div style={{ fontWeight: '500', color: '#495057' }}>
                          {project.createdBy?.realName || project.createdBy?.username || 'Unknown User'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          {new Date(project.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
  [responsive.mediaQuery('480px')]: {
    flexDirection: 'column',
    gap: '8px'
  }
   }}>
                    <button
                      onClick={() => navigate(`/raos/${project._id}`)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#0056b3';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      📋 View RAOS
                    </button>
                    {status === 'Completed' && (
                      <button
                        onClick={() => navigate(`/mock/${project._id}`)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#218838';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#28a745';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        🎨 View UI
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination component */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default DashboardPage;