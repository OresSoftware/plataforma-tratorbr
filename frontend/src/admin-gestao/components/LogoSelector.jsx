// frontend/src/admin-gestao/components/LogoSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';

// Ícones SVG
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const LogoSelector = ({ value, onChange, label, name }) => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showGrid, setShowGrid] = useState(true); // Controla visibilidade do grid
  
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const gridContainerRef = useRef(null);
  const componentId = useRef(`logo-selector-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    carregarLogos();
  }, []);

  useEffect(() => {
    if (value) {
      setPreviewUrl(getLogoSrc(value));
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  // Fechar grid ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        gridContainerRef.current &&
        !gridContainerRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        // Se já tem uma logo selecionada, esconde o grid
        if (value) {
          setShowGrid(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const carregarLogos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/logos');
      if (response.data && response.data.data) {
        setLogos(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar logos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = (logoName) => {
    onChange({ target: { name, value: logoName } });
    // Esconde o grid após selecionar
    setShowGrid(false);
    // Limpa a busca
    setSearchTerm('');
  };

  const handleSearchFocus = () => {
    // Mostra o grid quando focar na busca
    setShowGrid(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Formato não suportado. Use PNG, JPG, JPEG, WEBP, GIF ou SVG');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Máximo: 3MB');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/admin/upload/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.ok) {
        onChange({ target: { name, value: response.data.filename } });
        setPreviewUrl(getLogoSrc(response.data.filename));
        await carregarLogos();
        setUploadSuccess(true);
        setTimeout(() => {
          setShowUpload(false);
          setSelectedFile(null);
          setUploadSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadError(error.response?.data?.error || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getLogoSrc = (fileName) => {
    if (!fileName) return '';
    return `/images/manufacturer/${fileName}`;
  };

  const getLogoDisplayName = (fileName) => {
    if (!fileName) return '';
    return fileName.replace(/\.(png|jpe?g|webp|gif|svg)$/i, '');
  };

  const filteredLogos = logos.filter(logo => 
    logo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="logo-selector-hibrido">
      {/* Label SEM asterisco */}
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
        {label.replace(' *', '')}
      </label>

      {/* Preview da logo atual */}
      {previewUrl && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          marginBottom: '12px'
        }}>
          <img 
            src={previewUrl} 
            alt="Logo atual"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              padding: '8px'
            }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            {getLogoDisplayName(value)}
          </span>
        </div>
      )}

      {/* Checkbox "Não encontrei" */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showUpload}
            onChange={(e) => {
              setShowUpload(e.target.checked);
              if (!e.target.checked) {
                setSelectedFile(null);
                setUploadError('');
              }
            }}
            style={{ width: '18px', height: '18px' }}
          />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Não encontrei minha logo</span>
        </label>
      </div>

      {/* CONDICIONAL: Mostra grid OU upload */}
      {!showUpload ? (
        <>
          {/* Campo de busca */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              pointerEvents: 'none'
            }}>
              <SearchIcon />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar logo... (clique para ver todas)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Grid visual de logos - Aparece/desaparece */}
          {showGrid && filteredLogos.length > 0 && (
            <div 
              ref={gridContainerRef}
              style={{
                padding: '16px',
                background: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                maxHeight: '400px',
                overflowY: 'auto',
                animation: 'fadeIn 0.2s ease-in'
              }}
            >
              <div style={{ marginBottom: '12px', fontWeight: '600', fontSize: '13px', color: '#6b7280' }}>
                {filteredLogos.length} logo{filteredLogos.length !== 1 ? 's' : ''} encontrada{filteredLogos.length !== 1 ? 's' : ''}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '12px'
              }}>
                {filteredLogos.map((logo, index) => (
                  <div
                    key={index}
                    onClick={() => handleLogoClick(logo)}
                    style={{
                      padding: '12px',
                      background: value === logo ? '#eff6ff' : 'white',
                      border: value === logo ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <img
                      src={getLogoSrc(logo)}
                      alt={logo}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'contain',
                        marginBottom: '8px'
                      }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <div style={{
                      fontSize: '11px',
                      wordBreak: 'break-word',
                      color: value === logo ? '#1e40af' : '#6b7280',
                      fontWeight: value === logo ? '600' : '400'
                    }}>
                      {getLogoDisplayName(logo)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Área de upload */
        <div style={{
          padding: '20px',
          background: '#f9fafb',
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
            onChange={handleFileSelect}
            id={`file-${componentId.current}`}
            style={{ display: 'none' }}
          />
          <label
            htmlFor={`file-${componentId.current}`}
            style={{
              padding: '40px 20px',
              background: 'white',
              border: '3px dashed #d1d5db',
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <UploadIcon />
            <div style={{ fontSize: '15px', fontWeight: '600', marginTop: '10px' }}>
              Clique para selecionar
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              PNG, JPG, JPEG, WEBP, GIF, SVG (máx. 3MB)
            </div>
          </label>

          {selectedFile && (
            <>
              <div style={{
                padding: '16px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                  style={{
                    padding: '10px',
                    background: '#fee2e2',
                    border: '2px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <XIcon />
                </button>
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || uploadSuccess}
                style={{
                  padding: '14px 20px',
                  background: uploading || uploadSuccess ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: uploading || uploadSuccess ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {uploading ? (
                  'Enviando...'
                ) : uploadSuccess ? (
                  <>
                    <CheckIcon /> Enviado!
                  </>
                ) : (
                  <>
                    <UploadIcon /> Enviar Logo
                  </>
                )}
              </button>
            </>
          )}

          {uploadError && (
            <div style={{
              padding: '14px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div style={{
              padding: '14px',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              Logo enviada com sucesso! Preview atualizado.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogoSelector;

