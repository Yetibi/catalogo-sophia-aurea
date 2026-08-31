'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import PieceCard from './PieceCard';
import PieceDetail from './PieceDetail';
import styles from './Catalogo.module.css';

const COLORS = {
  stone: {
    "Zafiro Azul": "#2E5090",
    "Zafiro": "#2E5090",
    "Rubí": "#9B2335",
    "Esmeralda": "#2D6A4F",
    "Diamante": "#C9C5BF",
    "Amatista": "#6B4C8A",
    "Zafiro Rosa": "#C77D8A",
    "Moissanita": "#C9C5BF",
  },
  colorName: {
    "Azul": "#2E5090",
    "Rojo": "#9B2335",
    "Verde": "#2D6A4F",
    "Blanco": "#C9C5BF",
    "Morado": "#6B4C8A",
    "Rosado": "#C77D8A",
    "Naranja": "#C9772E",
  },
};

function getUnique(arr, key) {
  return [...new Set(arr.map((i) => i[key]))].sort();
}

/** Vacío en desarrollo; en producción, el subdominio propio del catálogo. */
const PREFIJO_ASSETS =
  process.env.NODE_ENV === "production" ? "https://catalogo.sophiaaurea.co" : "";

export default function CatalogoSophiaAurea({ productos }) {
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    pieceType: "todas",
    stone: "todas",
    collection: "todas",
    figure: "todas",
  });

  const pieceTypes = useMemo(() => getUnique(productos, "tipo_pieza"), [productos]);
  const stones = useMemo(() => getUnique(productos, "piedra"), [productos]);
  const collections = useMemo(() => getUnique(productos, "coleccion"), [productos]);
  const figures = useMemo(() => getUnique(productos, "figura"), [productos]);

  const filtered = useMemo(() => {
    return productos.filter((p) => {
      if (filters.pieceType !== "todas" && p.tipo_pieza !== filters.pieceType) return false;
      if (filters.stone !== "todas" && p.piedra !== filters.stone) return false;
      if (filters.collection !== "todas" && p.coleccion !== filters.collection) return false;
      if (filters.figure !== "todas" && p.figura !== filters.figure) return false;
      return true;
    });
  }, [productos, filters]);

  const activeFilterCount = Object.values(filters).filter((v) => v !== "todas").length;

  const updateFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const clearFilters = () => {
    setFilters({ pieceType: "todas", stone: "todas", collection: "todas", figure: "todas" });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        {/* Ruta absoluta al subdominio propio: este catálogo también se sirve
            reenviado desde sophiaaurea.co/catalogo, y ahí /lockup... apunta al
            website de marca, que no tiene ese archivo (404, logo roto).
            assetPrefix no cubre /public, solo /_next. */}
        <Image
          src={`${PREFIJO_ASSETS}/lockup-completo-fondo-marfil.png`}
          alt="Sophia Auréa — Joyería con Alma"
          width={220}
          height={220}
          className={styles.logo}
          priority
        />
      </header>

      {/* Intro */}
      <div className={styles.intro}>
        <h2 className={styles.introTitle}>Nuestros artículos disponibles</h2>
        <p>
          Explora nuestra colección de joyas en oro 18K y piedras naturales.
          Cada artículo está hecho con intención y guarda un significado único.
        </p>
        <p className={styles.introInstruction}>
          Filtra por tipo de artículo, piedra o colección para encontrar el que
          resuena contigo. Cuando encuentres el tuyo, escríbenos por WhatsApp.
        </p>
        <div className={styles.divider}>
          <span></span>
          <span className={styles.dividerText}>Oro 18K · Piedras naturales · Hecho con intención</span>
          <span></span>
        </div>
      </div>

      {/* Filter panel - always visible */}
      <div className={styles.filterPanel}>
        <FilterRow
          label="Tipo de artículo"
          options={pieceTypes}
          value={filters.pieceType}
          onChange={(v) => updateFilter("pieceType", v)}
        />
        <FilterRow
          label="Piedra"
          options={stones}
          value={filters.stone}
          onChange={(v) => updateFilter("stone", v)}
          colors={COLORS.stone}
        />
        <FilterRow
          label="Colección"
          options={collections}
          value={filters.collection}
          onChange={(v) => updateFilter("collection", v)}
        />
        <FilterRow
          label="Figura"
          options={figures}
          value={filters.figure}
          onChange={(v) => updateFilter("figure", v)}
        />
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className={styles.clearBtn}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Results count */}
      <div className={styles.resultCount}>
        {filtered.length} {filtered.length === 1 ? "artículo" : "artículos"} disponibles
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map((p) => (
          <PieceCard key={p.id_producto} piece={p} onSelect={setSelected} colors={COLORS} />
        ))}
        {filtered.length === 0 && (
          <div className={styles.noResults}>
            No hay artículos que coincidan con los filtros seleccionados.<br />
            <button onClick={clearFilters} className={styles.noResultsLink}>
              Ver todos los artículos
            </button>
          </div>
        )}
      </div>

      {/* Fixed WhatsApp bar */}
      <div className={styles.whatsappBar}>
        <a
          href="https://wa.me/573022066687?text=Hola,%20vi%20el%20catálogo%20de%20Sophia%20Auréa%20y%20me%20interesa%20saber%20más%20sobre%20un%20artículo%20✨"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappBtn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Hablemos por WhatsApp
        </a>
      </div>

      {/* Detail modal */}
      {selected && <PieceDetail piece={selected} onClose={() => setSelected(null)} colors={COLORS} />}

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerTitle}>Sophia Auréa</p>
        <p className={styles.footerText}>
          Oro 18K · Piedras Naturales · Hecho con intención<br />
          Medellín, Colombia<br />
          <a href="https://instagram.com/sophiaaurea.joyas" target="_blank" rel="noopener noreferrer">
            @sophiaaurea.joyas
          </a>
        </p>
      </footer>
    </div>
  );
}

function FilterRow({ label, options, value, onChange, colors }) {
  return (
    <div className={styles.filterRow}>
      <div className={styles.filterLabel}>{label}</div>
      <div className={styles.filterChips}>
        <FilterChip label="Todas" active={value === "todas"} onClick={() => onChange("todas")} />
        {options.map((o) => (
          <FilterChip
            key={o}
            label={o}
            active={value === o}
            onClick={() => onChange(o)}
            dot={colors ? colors[o] : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, dot }) {
  return (
    <button
      onClick={onClick}
      className={styles.filterChip}
      style={{
        borderColor: active ? "var(--gold)" : "var(--border)",
        background: active ? "var(--gold-subtle)" : "transparent",
        color: active ? "var(--gold)" : "var(--muted)",
        fontWeight: active ? 500 : 400,
      }}
    >
      {dot && (
        <span
          className={styles.filterChipDot}
          style={{ background: dot }}
        />
      )}
      {label}
    </button>
  );
}
