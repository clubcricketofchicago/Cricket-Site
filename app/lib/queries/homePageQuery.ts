import {
  heroFragment,
  meetTheManagementFragment,
  timerBannerFragment,
  bannerFragment,
  fixturesGridFragment,
  sponsorsBannerFragment,
  tournamentSectionFragment
} from './fragments';

export function getHomePageQuery() {
  return `
    query HomePageQuery {
      entries(section: "homePage") {
        id
        ... on homePage_Entry {
          id
          homePageBlocks {
            ${heroFragment}
            ${meetTheManagementFragment}
            ${timerBannerFragment}
            ${bannerFragment}
            ${fixturesGridFragment}
            ${sponsorsBannerFragment}
            ${tournamentSectionFragment}
          }
        }
      }
    }
  `;
} 