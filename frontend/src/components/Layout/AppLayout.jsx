import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f5f5f0',
  },
  main: {
    flex: 1,
    padding: '28px',
    overflowY: 'auto',
  },
};