import { permanentRedirect } from 'next/navigation';

// 308 permanent: tells Google /catalogo is the definitive home of this content
export default function Home() {
  permanentRedirect('/catalogo');
}
