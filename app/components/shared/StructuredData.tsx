import { baseWhatsAppUrl } from '@/app/lib/constants';

const propertySchema = {
  '@context': 'https://schema.org',
  '@type': 'ApartmentComplex',
  name: 'Bella Vista Beach Residence',
  description:
    'Stúdios e apartamentos de 2 e 3 quartos com infraestrutura de resort em Coroa Vermelha.',
  url: 'https://bellavistaresidence.com.br',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Santa Cruz Cabrália',
    addressRegion: 'BA',
    addressCountry: 'BR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '-16.2833',
    longitude: '-39.0333',
  },
  telephone: baseWhatsAppUrl.replace('https://wa.me/', '+'),
};

export const StructuredData = () => (
  <script
    type='application/ld+json'
    dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }}
  />
);
