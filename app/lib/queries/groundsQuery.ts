import { groundInfoFragment } from './fragments';

export function getGroundsQuery() {
  return `
    query MyQuery {
      entries(section: "grounds") {
        id
        ... on groundInfo_Entry {
          ${groundInfoFragment}
        }
      }
    }
  `;
} 