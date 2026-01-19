import type { PathwaysMap } from '../types/location';

export const PATHWAYS: PathwaysMap = {
  north_main_pathway: {
    name: 'North Main',
    coordinates: [
      [126.09357428189492, 8.63319749028041],
      [126.09356214979526, 8.633253747451871],
      [126.09355572349156, 8.633296348512722],
      [126.0935394404083, 8.633400048264056],
      [126.09353139678105, 8.633448530659937],
      [126.09352802663678, 8.6334718543601],
      [126.09350032978199, 8.633647360207476],
      [126.09369096521928, 8.633670651976637],
      [126.09382628009621, 8.633688308638696],
      [126.09381049098332, 8.633986221753304],
      [126.09380146501734, 8.634186633262068],
      [126.09379470187042, 8.634284134867912],
      [126.09364744841791, 8.63427337039592],
      [126.0935001949654, 8.63426260592393],
      [126.09348687659612, 8.63460309742712],
      [126.09340353375882, 8.63459866983851],
    ],
  },
  canteen_path: {
    name: 'Canteen',
    coordinates: [
      [126.09355572349156, 8.633296348512722],
      [126.0934298160375, 8.633291120234912],
      [126.09340281504166, 8.633289869683537],
      [126.09340332681319, 8.633262547167739],
      [126.09338507364072, 8.63326086059395],
      [126.09331981336783, 8.63323326284548],
    ],
  },
  admin_path: {
    name: 'Administration',
    coordinates: [
      [126.09356214979526, 8.633253747451871],
      [126.09365672453441, 8.633267981823364],
      [126.09370167554721, 8.633275079982354],
    ],
  },
  admin_registrar_path: {
    name: 'Admin-Registrar',
    coordinates: [
      [126.09365672453441, 8.633267981823364],
      [126.0936463293728, 8.633336410982622],
      [126.09363333029262, 8.633417044422359],
      [126.0937400702191, 8.633453585956957],
    ],
  },
  main_registrar_connector: {
    name: 'Main-Registrar Bridge',
    coordinates: [
      [126.0935394404083, 8.633400048264056],
      [126.09363333029262, 8.633417044422359],
    ],
  },
  registrar_direct_path: {
    name: 'Registrar Direct',
    coordinates: [
      [126.0937400702191, 8.633453585956957],
      [126.09369096521928, 8.633670651976637],
    ],
  },
  commission_path: {
    name: 'Commission',
    coordinates: [
      [126.09357426967426, 8.63319764838188],
      [126.09353601709819, 8.6331959273041],
    ],
  },
  hm_building_path: {
    name: 'HM via Canteen',
    coordinates: [
      [126.0934298160375, 8.633291120234912],
      [126.09342771423962, 8.63334297704371],
      [126.0933989278463, 8.633343514028624],
    ],
  },
  hm_to_main_path: {
    name: 'HM to Main',
    coordinates: [
      [126.09339878208465, 8.633430892934001],
      [126.09353139678105, 8.633448530659937],
    ],
  },
  auditorium_path: {
    name: 'Auditorium Path',
    coordinates: [
      [126.09350032978199, 8.633647360207476],
      [126.09346533962781, 8.633676413425832],
      [126.09341325039117, 8.633688892800848],
      [126.09327555493164, 8.633706981217863],
      [126.09319287218536, 8.63376075885068],
      [126.09289119840713, 8.63411814156207],
    ],
  },
  south_extension: {
    name: 'South Extension',
    coordinates: [
      [126.09346533962781, 8.633676413425832],
      [126.09341985514288, 8.63389379950003],
      [126.0934118908905, 8.63401462002042],
      [126.09341030649549, 8.634138594319502],
      [126.09340353375882, 8.63459866983851],
    ],
  },
  main_entrance: {
    name: 'Main Entrance',
    coordinates: [
      [126.09365181388404, 8.633154772476885],
      [126.09357428189492, 8.63319749028041],
    ],
  },
};

export const PATHWAY_GROUPS = {
  'Main Pathways': ['north_main_pathway'],
  'Building Paths': [
    'canteen_path',
    'admin_path',
    'admin_registrar_path',
    'commission_path',
    'hm_building_path',
    'hm_to_main_path',
    'auditorium_path',
  ],
  'Connectors': ['main_registrar_connector', 'registrar_direct_path', 'south_extension'],
  'Entrances': ['main_entrance'],
};

export function getPathwayOptions() {
  const options: { [key: string]: Array<{ id: string; name: string }> } = {};

  Object.entries(PATHWAY_GROUPS).forEach(([group, pathIds]) => {
    options[group] = pathIds.map((id) => ({
      id,
      name: PATHWAYS[id]?.name || id,
    }));
  });

  return options;
}

export function getPathwayCoordinates(pathId: string): [number, number][] {
  const pathway = PATHWAYS[pathId];
  if (!pathway) return [];
  return pathway.coordinates;
}

export function getAllPathwayIds(): string[] {
  return Object.keys(PATHWAYS);
}
