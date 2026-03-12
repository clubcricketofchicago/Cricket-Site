import {
  heroFragment,
  meetTheManagementFragment,
  timerBannerFragment,
  bannerFragment,
  fixturesGridFragment,
  sponsorsBannerFragment,
  tournamentSectionFragment
} from './fragments';

export function getCCCAcademyQuery() {
  return `
    query HomePageQuery {
      entries(section: "cccAcademy") {
        id
        ... on cccAcademy_Entry {
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