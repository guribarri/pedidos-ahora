import { useUserContext } from '../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout.jsx';
import { useEffect, useState } from 'react';
import MenuService from '../services/MenuService.jsx';
import MenuForm from './MenuForm.jsx';

const Home = ({ onLogout }) => {
  const { usuario } = useUserContext();
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMenuId, setModalMenuId] = useState(null);
  const [modalMenuName, setModalMenuName] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [menuToEdit, setMenuToEdit] = useState(null);

  const loadMenus = async () => {
    try {
      const data = await MenuService.getAllMenus();
      setMenus(data || []);
    } catch (e) {
      console.error(e);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleDelete = (id) => {
    const m = menus.find((x) => x.id === id);
    setModalMenuId(id);
    setModalMenuName(m ? m.nombre : 'estemenu');
    setModalOpen(true);
  };

  const handleConfirmDelete = (id) => {
    MenuService.deleteMenu(id, usuario.email)
      .then(() => loadMenus())
      .catch((err) => window.alert(err.message));
  };

  const handleEdit = (id) => {
    const m = menus.find((x) => x.id === id);
    setMenuToEdit(m);
    setEditModalOpen(true);
  };

  return (
    <Layout onLogout={onLogout}>
      <div style={styles.page}>
        <main style={styles.mainContent}>
          <h1 style={styles.title}>¡Bienvenido de nuevo!</h1>
          <p style={styles.subtitle}>Gestiona tus pedidos y menús desde un solo lugar.</p>
          <div style={styles.divider} />
          <section style={styles.listWrapper}>
            <h2 style={styles.sectionTitle}>Menúes cargados</h2>

            {loading ? (
              <p>Cargando...</p>
            ) : (
              <div style={{ ...styles.cardGrid, gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(420px, 1fr))' : 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {menus.length === 0 && <p>No hay menúes cargados, agregue, por favor.</p>}
                {menus.map((m) => (
                  <article key={m.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>{m.nombre}</h3>
                      <span style={styles.price}>${Number(m.precio).toFixed(2)}</span>
                    </div>
                    <p style={styles.cardDesc}>{m.descripcion}</p>
                    <div style={styles.cardFooter}>
                      <div>
                        <button
                          style={styles.actionBtn}
                          onClick={() => handleEdit(m.id)}
                          aria-label="Editar"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          style={{ ...styles.actionBtn, ...styles.dangerBtn }}
                          onClick={() => handleDelete(m.id)}
                          aria-label="Borrar"
                          title="Borrar"
                        >
                          🗑️
                        </button>
                      </div>

                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      {modalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal} role="dialog" aria-modal="true">
            <h3 style={{ marginTop: 0 }}>Borrar Menú</h3>
            <p>¿Desea eliminar el menú "{modalMenuName}"?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button style={styles.hideBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button style={{ ...styles.actionBtn, ...styles.dangerBtnBorrarMenu }}
                onClick={() => { handleConfirmDelete(modalMenuId); setModalOpen(false); }}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
      {editModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={{ ...modalStyles.modal, maxWidth: '500px' }}> {/* Un poco más ancho para el form */}
            <MenuForm
              isModal={true}
              initialData={menuToEdit}
              onSuccess={() => {
                setEditModalOpen(false);
                loadMenus();
              }}
              onCancel={() => setEditModalOpen(false)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  page: {
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: '#f8f9fa',
    margin: 0,
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '40px',
  },
  title: {
    fontSize: '28px',
    color: '#2d3436',
    margin: '0 0 10px 0',
  },
  subtitle: {
    color: '#636e72',
    fontSize: '16px',
    marginBottom: '20px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#eee',
    margin: '20px 0',
    width: '95%',
    maxWidth: '1100px',
  },
  listWrapper: {
    marginTop: '6px',
    width: '98%',
    maxWidth: '1400px',
  },
  sectionTitle: {
    fontSize: '20px',
    margin: '10px 0 18px 0',
    color: '#2d3436',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '18px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '16px',
    margin: 0,
    color: '#2d3436',
  },
  price: {
    fontWeight: 700,
    color: '#2f9e44',
  },
  cardDesc: {
    color: '#69707a',
    fontSize: '14px',
    marginBottom: '12px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  actionBtn: {
    backgroundColor: '#4a5568',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginRight: '8px',
    fontSize: '13px',
  },
  dangerBtn: {
    backgroundColor: '#ff6b6b',
  },
  dangerBtnBorrarMenu: {
    backgroundColor: '#1cbd2a',
  },
  hideBtn: {
    backgroundColor: '#f1f2f6',
    color: '#333',
    border: '1px solid #e6e9ee',
    padding: '6px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: 'white',
    padding: '18px 20px',
    borderRadius: '10px',
    maxWidth: '420px',
    width: '90%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  },
};

export default Home;
