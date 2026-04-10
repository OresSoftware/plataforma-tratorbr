// frontend/src/admin-gestao/components/LogoSelector.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../lib/api';

/* ── Ícones SVG ── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ImageIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

/* ── Componente Principal ── */
const LogoSelector = ({ value, onChange, label, name }) => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('select'); // 'select' | 'upload'

  // Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const componentId = useRef(`logo-${Math.random().toString(36).substr(2, 9)}`);

  /* ── Carregar logos ── */
  useEffect(() => { carregarLogos(); }, []);

  const carregarLogos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/logos');
      if (response.data?.data) setLogos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar logos:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Fechar modal ao clicar fora ── */
  useEffect(() => {
    if (!showModal) return;
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        fecharModal();
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') fecharModal();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showModal]);

  /* ── Helpers ── */
  const getLogoSrc = (fileName) => {
    if (!fileName) return '';
    return `/images/manufacturer/${fileName}`;
  };

  const getDisplayName = (fileName) => {
    if (!fileName) return '';
    return fileName.replace(/\.(png|jpe?g|webp|gif|svg)$/i, '');
  };

  const fecharModal = () => {
    setShowModal(false);
    setSearchTerm('');
    setSelectedFile(null);
    setUploadError('');
    setUploadSuccess(false);
    setActiveTab('select');
  };

  /* ── Seleção de logo ── */
  const handleLogoClick = (logoName) => {
    onChange({ target: { name, value: logoName } });
    fecharModal();
  };

  /* ── Upload ── */
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
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await api.post('/admin/upload/logo', formData);
      if (response.data?.ok) {
        onChange({ target: { name, value: response.data.filename } });
        await carregarLogos();
        setUploadSuccess(true);
        setTimeout(() => fecharModal(), 1500);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Filtro ── */
  const filteredLogos = logos.filter(logo =>
    logo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ── Render ── */
  return (
    <div style={{ position: 'relative' }}>
      {/* Label */}
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        fontSize: '14px',
        color: '#374151'
      }}>
        {label.replace(' *', '')}
      </label>

      {/* ══════ Preview compacto + botão alterar ══════ */}
      <div
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '10px 14px',
          background: '#fff',
          border: '2px solid #e5e7eb',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minHeight: '60px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Thumbnail */}
        {value ? (
          <img
            src={getLogoSrc(value)}
            alt={getDisplayName(value)}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              padding: '4px',
              flexShrink: 0
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
              width: '100px',
              height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: '2px dashed #d1d5db',
            background: '#f9fafb',
            flexShrink: 0
          }}>
            <ImageIcon />
          </div>
        )}

        {/* Nome */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: value ? '#1f2937' : '#9ca3af',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {value ? getDisplayName(value) : 'Nenhuma logo selecionada'}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
            Clique para alterar
          </div>
        </div>

        {/* Botão */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: '#eff6ff',
          color: '#2563eb',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          flexShrink: 0
        }}>
          <EditIcon />
          Alterar
        </div>
      </div>

      {/* ══════ MODAL DE SELEÇÃO ══════ */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div
            ref={modalRef}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '680px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* ── Header do Modal ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1f2937' }}>
                Selecionar {label.replace(' *', '')}
              </h3>
              <button
                type="button"
                onClick={fecharModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280',
                  borderRadius: '6px',
                  display: 'flex'
                }}
              >
                <XIcon />
              </button>
            </div>

            {/* ── Tabs ── */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e5e7eb',
              padding: '0 24px'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('select')}
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'select' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'select' ? '#2563eb' : '#6b7280',
                  fontWeight: activeTab === 'select' ? '700' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <SearchIcon /> Buscar Logo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'upload' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'upload' ? '#2563eb' : '#6b7280',
                  fontWeight: activeTab === 'upload' ? '700' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UploadIcon /> Enviar Nova
              </button>
            </div>

            {/* ── Conteúdo ── */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

              {/* ━━ TAB: Selecionar ━━ */}
              {activeTab === 'select' && (
                <>
                  {/* Busca */}
                  <div style={{ padding: '16px 24px 12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        pointerEvents: 'none',
                        display: 'flex'
                      }}>
                        <SearchIcon />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar logo pelo nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
                      {filteredLogos.length} logo{filteredLogos.length !== 1 ? 's' : ''} encontrada{filteredLogos.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Grid de thumbnails */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 24px 20px',
                  }}>
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                        Carregando logos...
                      </div>
                    ) : filteredLogos.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                        Nenhuma logo encontrada.
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                        gap: '10px'
                      }}>
                        {filteredLogos.map((logo, index) => {
                          const isSelected = value === logo;
                          return (
                            <div
                              key={index}
                              onClick={() => handleLogoClick(logo)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '10px 6px 8px',
                                background: isSelected ? '#eff6ff' : '#fff',
                                border: isSelected ? '2px solid #3b82f6' : '2px solid #f3f4f6',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                position: 'relative'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = '#93c5fd';
                                  e.currentTarget.style.background = '#f0f9ff';
                                }
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) {
                                  e.currentTarget.style.borderColor = '#f3f4f6';
                                  e.currentTarget.style.background = '#fff';
                                }
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {isSelected && (
                                <div style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  width: '20px',
                                  height: '20px',
                                  background: '#2563eb',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                </div>
                              )}
                              <img
                                src={getLogoSrc(logo)}
                                alt={getDisplayName(logo)}
                                style={{
                                  width: '64px',
                                  height: '64px',
                                  objectFit: 'contain',
                                  marginBottom: '6px'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div style={{
                                fontSize: '11px',
                                color: isSelected ? '#1e40af' : '#6b7280',
                                fontWeight: isSelected ? '600' : '400',
                                textAlign: 'center',
                                wordBreak: 'break-word',
                                lineHeight: '1.3',
                                maxWidth: '100%'
                              }}>
                                {getDisplayName(logo)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ━━ TAB: Upload ━━ */}
              {activeTab === 'upload' && (
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                    onChange={handleFileSelect}
                    id={`file-${componentId.current}`}
                    style={{ display: 'none' }}
                  />

                  {!selectedFile ? (
                    <label
                      htmlFor={`file-${componentId.current}`}
                      style={{
                        padding: '40px 20px',
                        background: '#f9fafb',
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.background = '#eff6ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.background = '#f9fafb';
                      }}
                    >
                      <UploadIcon />
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>
                        Clique para selecionar
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        PNG, JPG, JPEG, WEBP, GIF, SVG (max. 3MB)
                      </div>
                    </label>
                  ) : (
                    <>
                      {/* Preview do arquivo */}
                      <div style={{
                        padding: '16px',
                        background: '#f9fafb',
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
                            borderRadius: '8px',
                            background: '#fff',
                            padding: '6px'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
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
                            padding: '8px',
                            background: '#fee2e2',
                            border: '2px solid #fecaca',
                            borderRadius: '8px',
                            color: '#dc2626',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            display: 'flex'
                          }}
                        >
                          <XIcon />
                        </button>
                      </div>

                      {/* Botão enviar */}
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading || uploadSuccess}
                        style={{
                          padding: '14px 20px',
                          background: uploading || uploadSuccess ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: uploading || uploadSuccess ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: uploading || uploadSuccess ? 'none' : '0 4px 12px rgba(59,130,246,0.3)'
                        }}
                      >
                        {uploading ? 'Enviando...' : uploadSuccess ? (<><CheckIcon /> Enviado!</>) : (<><UploadIcon /> Enviar Logo</>)}
                      </button>
                    </>
                  )}

                  {uploadError && (
                    <div style={{
                      padding: '12px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      {uploadError}
                    </div>
                  )}
                  {uploadSuccess && (
                    <div style={{
                      padding: '12px',
                      background: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      Logo enviada com sucesso!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Animações CSS ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LogoSelector;
