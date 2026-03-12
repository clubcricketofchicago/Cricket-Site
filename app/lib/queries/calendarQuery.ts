import { fixtureCardFragment } from './fragments';

export function getCalendarQuery() {
  return `
     query MyQuery {
      entries(section: "fixtures", orderBy: "date ASC") {
        id
        ... on fixtureCard_Entry {
          ${fixtureCardFragment}
        }
      }
    }
  `;
} 