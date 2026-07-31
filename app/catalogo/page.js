'use client';

import { useState, useEffect } from 'react';
import CatalogoSophiaAurea from '@/components/Catalogo';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProductos() {
      try {
        const response = await fetch('/api/productos');
        const data = await response.json();

        if (data.success) {
          setProductos(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          Verifica que el Excel esté diligenciado y el acceso a Microsoft Graph esté configurado.
        </p>
      </div>
    );
  }

  return <CatalogoSophiaAurea productos={productos} />;
}
