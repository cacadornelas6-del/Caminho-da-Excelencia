/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PathfinderClassInfo {
  name: string;
  age: number;
  color: string;
  advancedName: string;
  requirements: string[];
}

export const PATHFINDER_CLASSES: PathfinderClassInfo[] = [
  {
    name: 'Amigo',
    age: 10,
    color: '#0284C7', // Blue
    advancedName: 'Amigo da Natureza',
    requirements: [
      'Memorizar e explicar o Voto e a Lei dos Desbravadores',
      'Leitura do livro do Ano Bíblico do juvenil',
      'Leitura do livro de curso de leitura do ano',
      'Especialidade de Cães ou Gatos',
      'Conhecer os nós básicos: direito, oito, escota, lais de guia',
      'Participar de uma caminhada ecológica de 5 km',
    ],
  },
  {
    name: 'Companheiro',
    age: 11,
    color: '#DC2626', // Red
    advancedName: 'Companheiro de Excursionismo',
    requirements: [
      'Memorizar e explicar o Alvo e o Lema dos Desbravadores',
      'Memorizar a primeira estrofe e coro do Hino dos Desbravadores',
      'Especialidade de Primeiros Socorros - Básico',
      'Pernoitar em acampamento em barraca armada pela unidade',
      'Identificar e cuidar de 3 espécies de árvores nativas',
      'Demonstrar 6 nós adicionais e 2 amarras (quadrada e diagonal)',
    ],
  },
  {
    name: 'Pesquisador',
    age: 12,
    color: '#16A34A', // Green
    advancedName: 'Pesquisador de Campo e Bosque',
    requirements: [
      'Memorizar e explicar o Objetivo e o Voto de Fidelidade à Bíblia',
      'Especialidade de Mapa e Bússola',
      'Participar de debate sobre os efeitos do fumo e drogas no corpo',
      'Acampamento com fogueira sem fósforos e culinária ao ar livre',
      'Construir um móvel de pioneiria utilizando amarras',
      'Participar de projeto de serviço comunitário por 2 horas',
    ],
  },
  {
    name: 'Pioneiro',
    age: 13,
    color: '#9333EA', // Purple
    advancedName: 'Pioneiro de Novas Fronteiras',
    requirements: [
      'Memorizar e explicar o Voto de Temperança',
      'Especialidade de Resgate Básico ou Salvamento',
      'Planejar e liderar uma reunião de unidade completa',
      'Caminhada de 10 km com mochila e abrigo improvisado',
      'Identificar 5 constelações no céu noturno',
      'Elaborar um diário de oração e estudo espiritual de 30 dias',
    ],
  },
  {
    name: 'Excursionista',
    age: 14,
    color: '#EA580C', // Orange
    advancedName: 'Excursionista na Mata',
    requirements: [
      'Memorizar e explicar os Ideais e o Significado do Emblema D1',
      'Especialidade de Liderança Campestre ou Sobrevivência',
      'Completar uma caminhada de 15 km com coordenadas geográficas',
      'Instrutor de um nó ou requisito prático para a classe de Amigo',
      'Participar ativamente de campanha de arrecadação do clube',
      'Construir um abrigo de emergência que suporte chuva e vento',
    ],
  },
  {
    name: 'Guia',
    age: 15,
    color: '#CA8A04', // Gold
    advancedName: 'Guia de Liderança',
    requirements: [
      'Compreender e apresentar os 28 princípios bíblicos fundamentais',
      'Especialidade de Oratória ou Liderança de Juvenis',
      'Organizar um evento espiritual ou social para o clube',
      'Caminhada de sobrevivência de 20 km com orientação por bússola',
      'Supervisionar uma unidade durante um acampamento oficial',
      'Capacitar membros na prevenção de acidentes e primeiros socorros',
    ],
  },
];

export interface SpecialtyItem {
  name: string;
  category: string;
  badgeColor: string;
  defaultPoints: number;
}

export const SPECIALTY_CATEGORIES: { category: string; specialties: SpecialtyItem[] }[] = [
  {
    category: 'Natureza',
    specialties: [
      { name: 'Astronomia', category: 'Natureza', badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50', defaultPoints: 50 },
      { name: 'Aves', category: 'Natureza', badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50', defaultPoints: 40 },
      { name: 'Árvores', category: 'Natureza', badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50', defaultPoints: 40 },
      { name: 'Mamíferos', category: 'Natureza', badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50', defaultPoints: 40 },
      { name: 'Climatologia', category: 'Natureza', badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50', defaultPoints: 50 },
      { name: 'Ecologia', category: 'Natureza', badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50', defaultPoints: 60 },
    ],
  },
  {
    category: 'Atividades Práticas e Campestres',
    specialties: [
      { name: 'Nós e Amarras', category: 'Atividades Práticas', badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-700/50', defaultPoints: 50 },
      { name: 'Fogueiras e Cozinha ao Ar Livre', category: 'Atividades Práticas', badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-700/50', defaultPoints: 50 },
      { name: 'Excursionismo Pedestre', category: 'Atividades Práticas', badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-700/50', defaultPoints: 60 },
      { name: 'Pioneirismo', category: 'Atividades Práticas', badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-700/50', defaultPoints: 70 },
      { name: 'Orientação com Mapa e Bússola', category: 'Atividades Práticas', badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-700/50', defaultPoints: 60 },
    ],
  },
  {
    category: 'Ciência e Saúde',
    specialties: [
      { name: 'Primeiros Socorros - Básico', category: 'Ciência e Saúde', badgeColor: 'bg-red-900/40 text-red-300 border-red-700/50', defaultPoints: 60 },
      { name: 'Primeiros Socorros - Avançado', category: 'Ciência e Saúde', badgeColor: 'bg-red-900/40 text-red-300 border-red-700/50', defaultPoints: 80 },
      { name: 'Resgate Básico', category: 'Ciência e Saúde', badgeColor: 'bg-red-900/40 text-red-300 border-red-700/50', defaultPoints: 70 },
      { name: 'Nutrição e Culinária Saudável', category: 'Ciência e Saúde', badgeColor: 'bg-red-900/40 text-red-300 border-red-700/50', defaultPoints: 50 },
      { name: 'Temperança e Saúde Física', category: 'Ciência e Saúde', badgeColor: 'bg-red-900/40 text-red-300 border-red-700/50', defaultPoints: 40 },
    ],
  },
  {
    category: 'Habilidades Manuais e Artesanais',
    specialties: [
      { name: 'Arte em Trançado', category: 'Habilidades Manuais', badgeColor: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50', defaultPoints: 40 },
      { name: 'Cerâmica e Modelagem', category: 'Habilidades Manuais', badgeColor: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50', defaultPoints: 40 },
      { name: 'Marcenaria Básica', category: 'Habilidades Manuais', badgeColor: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50', defaultPoints: 50 },
    ],
  },
  {
    category: 'Atividades Missionárias e Liderança',
    specialties: [
      { name: 'Evangelismo Pessoal', category: 'Atividades Missionárias', badgeColor: 'bg-blue-900/40 text-blue-300 border-blue-700/50', defaultPoints: 60 },
      { name: 'Oratória e Pregação', category: 'Atividades Missionárias', badgeColor: 'bg-blue-900/40 text-blue-300 border-blue-700/50', defaultPoints: 70 },
      { name: 'Liderança de Juvenis', category: 'Atividades Missionárias', badgeColor: 'bg-blue-900/40 text-blue-300 border-blue-700/50', defaultPoints: 80 },
      { name: 'Pacifismo e Resolução de Conflitos', category: 'Atividades Missionárias', badgeColor: 'bg-blue-900/40 text-blue-300 border-blue-700/50', defaultPoints: 50 },
    ],
  },
];
