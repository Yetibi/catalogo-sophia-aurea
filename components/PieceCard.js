'use client';

import styles from './PieceCard.module.css';

function getStoneHex(stone, colors) {
  return colors.stone[stone] || '#A89B8C';
}

export default function PieceCard({ piece, onSelect, colors }) {
  const hex = getStoneHex(piece.piedra, colors);

  return (
    <button
      onClick={() => onSelect(piece)}
      className={styles.card}
      aria-label={`Ver detalles de ${piece.nombre}`}
    >
      {/* Image area */}
      <div className={styles.imageArea}>
        {piece.url_foto ? (
          <img src={piece.url_foto} alt={piece.nombre} className={styles.image} loading="lazy" />
        ) : (
          <>
            <div
              className={styles.stoneDot}
              style={{
                background: `radial-gradient(circle at 35% 35%, ${hex}88, ${hex})`,
                boxShadow: `0 4px 16px ${hex}33, inset 0 2px 4px rgba(255,255,255,0.2)`,
              }}
            />
            <span className={styles.placeholder}>Foto próximamente</span>
            <div className={styles.badge}>Próximamente</div>
          </>
        )}

        <div className={styles.pieceTypeBadge}>{piece.tipo_pieza}</div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.stoneInfo}>
          <span
            className={styles.stoneDotSmall}
            style={{ background: hex }}
          />
          <span className={styles.stoneLabel}>
            {piece.piedra} · {piece.tamano}
          </span>
        </div>

        <h3 className={styles.name}>{piece.nombre}</h3>

        <p className={styles.phrase}>"{piece.frase_ancla}"</p>
      </div>
    </button>
  );
}
