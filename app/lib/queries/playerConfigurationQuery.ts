

export function getPlayerConfiguration() {
  return `
    query MyQuery {
      globalSet {
        ... on playersPageConfiguration_GlobalSet {
          id
          name
          lightswitch
        }
      }
    }

  `;
} 