import type { CondominiumProfile } from '@/src/mock/types';

export const mockCondominiums: CondominiumProfile[] = [
  {
    id: 'bella-vista',
    name: 'Residencial Bella Vista',
    city: 'Porto Seguro',
    towers: ['Torre A', 'Torre B', 'Torre C'],
    gates: ['Portao Principal', 'Portao de Servico', 'Acesso Garagem'],
    securityTeam: ['Joao Pereira', 'Rafael Alves', 'Paulo Nunes'],
    residentsCount: 384,
  },
  {
    id: 'parque-sul',
    name: 'Condominio Parque Sul',
    city: 'Salvador',
    towers: ['Bloco 1', 'Bloco 2', 'Bloco 3', 'Bloco 4'],
    gates: ['Portaria Sul', 'Portaria Norte', 'Portao Visitantes'],
    securityTeam: ['Livia Souza', 'Mateus Rocha', 'Gilberto Lima'],
    residentsCount: 522,
  },
  {
    id: 'jardim-atlantico',
    name: 'Condominio Jardim Atlantico',
    city: 'Ilheus',
    towers: ['Torre Mar', 'Torre Sol'],
    gates: ['Portaria Central', 'Acesso Moradores', 'Acesso Carga'],
    securityTeam: ['Daniel Cruz', 'Bianca Prado', 'Tiago Freitas'],
    residentsCount: 271,
  },
];
