import { useEffect, useState } from 'react';
import GestaoLayout from '../components/GestaoLayout';
import { listarUsuariosGestao } from '../services/apiUserAuth';
import './style/UsuariosGestaoPage.css';

const UsuariosGestaoPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        setLoading(true);
        setErro('');

        const response = await listarUsuariosGestao();
        setUsuarios(response?.data || []);
      } catch (error) {
        setErro('Não foi possível carregar os usuários da empresa.');
      } finally {
        setLoading(false);
      }
    }

    carregarUsuarios();
  }, []);

  return (
    <GestaoLayout>
      <div className="usuarios-gestao-page">
        <h1>Usuários da Empresa</h1>
        <p>Veja abaixo os usuários vinculados à sua empresa do usuário logado.</p>

        {loading && <p>Carregando usuários...</p>}

        {!loading && erro && <p>{erro}</p>}

        {!loading && !erro && usuarios.length === 0 && (
          <p>Nenhum usuário encontrado para esta empresa.</p>
        )}

        {!loading && !erro && usuarios.length > 0 && (
          <div className="usuarios-gestao-tabela-wrapper">
            <table className="usuarios-gestao-tabela">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Cargo</th>
                  <th>Ocupação</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.user_id}>
                    <td>{usuario.user_id}</td>
                    <td>{`${usuario.firstname || ''} ${usuario.lastname || ''}`.trim()}</td>
                    <td>{usuario.email || '-'}</td>
                    <td>{usuario.fone || '-'}</td>
                    <td>{usuario.cargo_nome || '-'}</td>
                    <td>{usuario.ocupacao_nome || '-'}</td>
                    <td>{usuario.status === 1 ? 'Ativo' : 'Inativo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </GestaoLayout>
  );
};

export default UsuariosGestaoPage;
