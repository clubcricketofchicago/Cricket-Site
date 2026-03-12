import {
    tournamentYearFragment,
    tournamentPageFragment
  } from './fragments';
  
  export function getTournamentPageQuery() {
    return `
      query TournamentPageQuery {
        entries(section: "tournaments") {
          id
          ${tournamentYearFragment}
          ${tournamentPageFragment}
        }
      }
    `;
  }
  