import { redirect } from 'next/navigation';

// Este proyecto se sirve de dos formas: directo en catalogo.sophiaaurea.co y
// reenviado desde sophiaaurea.co/catalogo. Un redirect permanente en la raíz
// hacía que el navegador reescribiera la URL al dominio del visitante y
// volviera a entrar aquí: bucle infinito. Con 307 temporal, el reenvío
// interno resuelve /catalogo sin rebotar.
export default function Home() {
  redirect('/catalogo');
}
