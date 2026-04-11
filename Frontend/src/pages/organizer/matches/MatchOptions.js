export const GAME_MAP_OPTIONS = {
  'PUBG Mobile': ['Erangel', 'Miramar', 'Sanhok', 'Vikendi'],
  'Free Fire': ['Bermuda', 'Purgatory', 'Kalahari', 'Nexteera'],
};

export const getMapsForGame = (gameTitle = '') => {
  const normalizedTitle = String(gameTitle || '').trim().toLowerCase();

  if (normalizedTitle === 'pubg mobile') {
    return GAME_MAP_OPTIONS['PUBG Mobile'];
  }

  if (normalizedTitle === 'free fire') {
    return GAME_MAP_OPTIONS['Free Fire'];
  }

  return [];
};

export const modes = [
  'Solo',
  'Duo',
  'Squad',
  // Add more modes as needed
];
