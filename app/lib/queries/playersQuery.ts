import { playerDetailedCardFragment } from './fragments';

export function getPlayersQuery() {
  return `
    query MyQuery {
      entries(
        section: "players", 
        orderBy: "scorebycaptain desc"
      ) {
        id
        ... on playerDetailedCard_Entry {
          ${playerDetailedCardFragment}
        }
      }
    }
  `;
}
