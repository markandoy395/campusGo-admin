export const BUILDING_OPTIONS = [
  'Pearson Building',
  'Old Academic Building',
  'BSHM Building',
  'Registrar Office',
  'Commission Building',
  'Admin Building',
  'Canteen',
  'Extension Office',
  'ROTC Office',
  'New Building',
  'Old Fisheries Building',
];

export const FLOOR_OPTIONS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
];

export const TYPE_OPTIONS = [
  'classroom',
  'laboratory',
  'computer_lab',
  'lecture_hall',
  'office',
  'department_office',
  'admin_office',
  'facility',
  'library',
  'canteen',
  'clinic',
  'auditorium',
  'building_entrance',
  'gate',
  'restroom',
  'study_area',
];

export const CATEGORY_OPTIONS = [
  'location',
  'building',
  'pathway',
  'entrance',
  'academic',
  'administrative',
  'facility',
  'service',
  'landmark',
  'outdoor',
];

// Helper to format type and category for display
export const formatOptionLabel = (value: string): string => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

