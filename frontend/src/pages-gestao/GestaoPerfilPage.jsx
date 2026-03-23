import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Building, MapPin, User, Briefcase, Calendar, FileText, Edit2 } from 'lucide-react';
import GestaoLayout from '../components/GestaoLayout';
import './style/GestaoPerfilPage.css';

const GestaoPerfilPage = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('appUserData') || '{}');

    useEffect(() => {
        if (!userData?.user_id) {
            navigate('/entrar');
        }
    }, [userData, navigate]);

    const construirUrlLogo = (caminhoRelativo) => {
        if (!caminhoRelativo) return '';
        if (caminhoRelativo.startsWith('http')) {
            return caminhoRelativo;
        }
        const caminho = caminhoRelativo.startsWith('/') ? caminhoRelativo : '/' + caminhoRelativo;
        return `https://app.tratorbr.com${caminho}`;
    };

    const fotoPerfil = construirUrlLogo(userData?.image_logo_site);
    const logoEmpresa = construirUrlLogo(userData?.enterprise_image_logo_site);

    return (
        <GestaoLayout>
            <div className="perfil-container">
                <div className="perfil-header">
                    <div className="header-content">
                        <h1>Meu Perfil</h1>
                    </div>
                </div>

                <div className="perfil-banner">
                    <div className="foto-section-banner">
                        {fotoPerfil ? (
                            <img src={fotoPerfil} alt={userData?.firstname} className="foto-perfil-banner" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                            <div className="foto-placeholder-banner">
                                <User size={48} />
                            </div>
                        )}
                    </div>

                    <div className="info-section-banner">
                        <h2>{userData?.firstname} {userData?.lastname}</h2>

                        <div className="badges-container">

                            <div className="empresa-abaixo-foto">
                                {logoEmpresa && (
                                    <img src={logoEmpresa} alt="Logo da Empresa" className="logo-empresa-miniatura" onError={(e) => { e.target.style.display = 'none'; }} />
                                )}
                                <span className="nome-empresa-foto">
                                    {userData?.enterprise_fantasia || userData?.enterprise_razao || 'Empresa não informada'}
                                </span>
                            </div>

                            <span className="empresa-abaixo-foto">
                                <Briefcase size={14} />
                                {userData?.ocupacao_name} • {userData?.cargo_name}
                            </span>
                            <span className="empresa-abaixo-foto">
                                <Mail size={14} />
                                {userData?.email}
                            </span>
                        </div>
                    </div>


                </div>

                <div className="perfil-section">
                    <div id="perfil" className="section-title-titile">
                        <h2 id='titulo' className="section-title-titile"><User size={20} />Dados Pessoais</h2>
                        <div className="action-section-banner">
                            <button className="btn-edit-banner" onClick={() => { }}>
                                <Edit2 size={16} />
                                Editar Perfil
                            </button>
                        </div>
                    </div>

                    <div className="dados-grid">
                        <div className="dado-item">
                            <label><User size={14} />Nome Completo</label>
                            <span>{userData?.firstname} {userData?.lastname}</span>
                        </div>
                        <div className="dado-item">
                            <label><Mail size={14} />Email</label>
                            <span>{userData?.email || '—'}</span>
                        </div>
                        <div className="dado-item">
                            <label><FileText size={14} />CPF</label>
                            <span>{userData?.cpf || 'Não informado'}</span>
                        </div>
                        <div className="dado-item">
                            <label><Phone size={14} />Telefone</label>
                            <span>{userData?.fone || 'Não informado'}</span>
                        </div>

                        <div className="dado-item">
                            <label>Ramo de Atividade</label>
                            <span>{userData?.ocupacao_name || '—'}</span>
                        </div>
                    </div>
                </div>

                <div className="perfil-section">
                    <h2 className="section-title-titile"><Building size={20} /> Empresa Vinculada</h2>
                    <div className="dados-grid">
                        <div className="dado-item">
                            <label> Razão Social</label>
                            <span>{userData?.enterprise_razao || '—'}</span>
                        </div>
                        <div className="dado-item">
                            <label> Nome Fantasia</label>
                            <span>{userData?.enterprise_fantasia || '—'}</span>
                        </div>
                        <div className="dado-item">
                            <label> CNPJ</label>
                            <span>{userData?.enterprise_cnpj || '—'}</span>
                        </div>
                        <div className="dado-item">
                            <label><Mail size={14} /> Email Corporativo</label>
                            <span>{userData?.enterprise_email || '—'}</span>
                        </div>
                        <div className="dado-item">
                            <label><Phone size={14} /> Telefone</label>
                            <span>{userData?.enterprise_fone || '—'}</span>
                        </div>
                        <div className="dado-item">
                            <label><MapPin size={14} /> Localização</label>
                            <span>{userData?.enterprise_cidade} {userData?.enterprise_uf ? `- ${userData?.enterprise_uf}` : ''}</span>
                        </div>
                    </div>
                </div>

                <div className="grid-duas-colunas">
                    <div className="perfil-section">
                        <h2 className="section-title-titile"><Calendar size={20} /> Plano e Status</h2>
                        <div id="plano-status" className="dados-grid">
                            <div className="dado-item">
                                <label> Plano Válido Até</label>
                                <span className="destaque-data">
                                    {userData?.plano_valido
                                        ? new Date(userData.plano_valido).toLocaleDateString('pt-BR')
                                        : 'Não informado'
                                    }
                                </span>
                            </div>
                            <div className="dado-item">
                                <label>Status da Conta</label>
                                <span className={`status-badge ${userData?.status === 1 ? 'ativo' : 'inativo'}`}>
                                    {userData?.status === 1 ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GestaoLayout>
    );
};

export default GestaoPerfilPage;