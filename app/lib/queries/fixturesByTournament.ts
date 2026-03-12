// Make sure this matches your file name and path
export const getFixturesByTournamentSlug = () => `
  query GetFixturesByTournamentSlug($slug: [String]) {
    entries(section: "fixtures") {
      id
      ... on fixtureCard_Entry {
        id
        title
        t1t2NativeFlag
        groundsName
        date
        t1Name
        t1Logo {
          id
          title
          url
          alt
        }
        t2Name
        t2Logo {
          id
          title
          url
          alt
        }
        # Instead of using "relatedTo", we query fixtures 
        # then filter by the mappedSeries slug
        mappedSeries(slug: $slug) {
          ... on tournamentPage_Entry {
            id
            title
            slug
          }
        }
      }
    }
  }
`;
