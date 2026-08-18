'use client';

import Image from 'next/image';
import styles from './PieceDetail.module.css';

function getStoneHex(stone, colors) {
  return colors.stone[stone] || '#A89B8C';
}

function getColorNameHex(colorName, colors) {
  return colors.colorName?.[colorName] || '#A89B8C';
}

function formatPrecio(precio) {
  const numero = Number(precio);
  if (!precio || Number.isNaN(numero)) return '';
  return `$ ${numero.toLocaleString('es-CO')}`;
}

export default function PieceDetail({ piece, onClose, colors }) {
  const hex = getStoneHex(piece.piedra, colors);
  const colorHex = getColorNameHex(piece.color_piedra, colors);
  const precioFormateado = formatPrecio(piece.precio);

  const waLink = `https://wa.me/573022066687?text=${encodeURIComponent(
    `Hola, vi el catálogo de Sophia Auréa y me interesa el artículo "${piece.nombre}" (${piece.tipo_pieza} · ${piece.piedra}) ✨`
  )}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-label={piece.nombre}
        onClick={(e) => e.stopPropagation()}
        className={styles.modal}
      >
        {/* Handle */}
        <div className={styles.handle} />

        {/* Image */}
        <div
          className={styles.imageArea}
          style={
            piece.url_foto
              ? undefined
              : { background: `linear-gradient(145deg, var(--bg), var(--surface-hover))` }
          }
        >
          {piece.url_foto ? (
            <Image
              src={piece.url_foto}
              alt={piece.nombre}
              fill
              sizes="480px"
              unoptimized
              className={styles.image}
            />
          ) : (
            <>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${hex}88, ${hex})`,
                  boxShadow: `0 6px 24px ${hex}33, inset 0 2px 6px rgba(255,255,255,0.25)`,
                }}
              />
              <span className={styles.placeholder}>Foto próximamente</span>
            </>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.meta}>
            <span
              className={styles.stoneDot}
              style={{ background: hex }}
            />
            <span className={styles.metaLabel}>
              {piece.coleccion} · {piece.tipo_pieza}
            </span>
          </div>

          <h2 className={styles.title}>{piece.nombre}</h2>

          <p className={styles.subtitle}>
            {piece.figura} · {piece.material}
          </p>

          <p className={styles.phrase}>{piece.descripcion || `"${piece.frase_ancla}"`}</p>

          {/* Attributes */}
          <div className={styles.attributes}>
            <AttributeRow label="Figura" value={piece.figura} />
            <AttributeRow label="Tipo de artículo" value={piece.tipo_pieza} />
            <AttributeRow label="Piedra" value={piece.piedra} dot={hex} />
            <AttributeRow label="Color de piedra" value={piece.color_piedra} dot={colorHex} />
            <AttributeRow label="Tamaño" value={piece.tamano} />
            {/* Dimensiones oculta temporalmente a pedido del usuario */}
            <AttributeRow label="Material" value={piece.material} last={!precioFormateado} />
            {precioFormateado && (
              <AttributeRow label="Precio" value={precioFormateado} emphasis last={true} />
            )}
          </div>

          {/* Symbolizes */}
          <div className={styles.symbolizes}>
            <h4 className={styles.symbolizeLabel}>Simboliza</h4>
            <p className={styles.symbolizeText}>{piece.simboliza}</p>
          </div>

          {/* Message */}
          <div className={styles.message}>
            <p>{piece.mensaje}</p>
          </div>

          {/* CTA */}
          {piece.url_foto ? (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.cta}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Me interesa este artículo
            </a>
          ) : (
            <div className={styles.unavailable}>
              Este artículo estará disponible próximamente
            </div>
          )}

          <button onClick={onClose} className={styles.closeBtn}>
            Volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
}

function AttributeRow({ label, value, dot, last, emphasis }) {
  return (
    <div className={styles.attributeRow} style={{ borderBottom: last ? 'none' : undefined }}>
      <span className={styles.attributeLabel}>{label}</span>
      <span className={emphasis ? styles.attributeValueEmphasis : styles.attributeValue}>
        {dot && (
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: dot,
              border: '1px solid rgba(0,0,0,0.1)',
              marginRight: 6,
            }}
          />
        )}
        {value}
      </span>
    </div>
  );
}
