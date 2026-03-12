// Fragment definitions for different content blocks
export const heroFragment = `
  ... on homeHeroBanner_Entry {
    id
    title
    typeHandle
    bgImageOne{
      id
      url
      filename
      title
      alt
    }
    p1Hyperlink {
            url
          }
    heroImageOne {
      id
      url
      filename
      title
      alt
    }
    
    bgImageTwo{
      id
      url
      filename
      title
      alt
    }
    p2Hyperlink {
            url
          }
    heroImageTwo {
      id
      url
      filename
      title
      alt
    }

    bgImageThree{
      id
      url
      filename
      title
      alt
    }
    p3Hyperlink {
            url
          }
    heroImageThree {
      id
      url
      filename
      title
      alt
    }
  }
`;

export const meetTheManagementFragment = `
  ... on meetTheManagement_Entry {
          id
          title
          typeHandle
          managementPlayerBlocks {
            ... on managementPlayer_Entry {
              id
              title
              playerEmail
              playerImage {
                alt
                id
                title
                url
              }
              designation
              phoneNumber
              biography
            }
          }
          
  }
`;

export const timerBannerFragment = `
  ... on timerBanner_Entry {
          id
          title
          typeHandle
          counterDate
          CTA
          hyperlink {
            url
          }
          CMTextArea
          convertedCTA
          convertedHyperlink {
            url
          }
          bgImage {
            alt
            id
            title
            url
          }
          
  }
`;

export const bannerFragment = `
  ... on banner_Entry {
          id
          bodyCopy
          cta
          title
      		typeHandle
          ctaHyperlink {
            url
          }
          logo {
            alt
            id
            url
            title
          }
            image {
            alt
            id
            url
            title
          }
  }
`;

export const fixturesGridFragment = `
  ... on fixturesGrid_Entry {
    id
    title
    typeHandle
    fixturesEntries(date: ["> now"], orderBy: "date ASC") {
      id
      title
      ... on fixtureCard_Entry {
        id
        date
        groundsName
        t1Name
        t1Logo {
          url
          id
          alt
          title
        }
        t2Name
        t2Logo {
          url
          id
          title
          alt
        }
      }
    }
  }
`;

export const sponsorsBannerFragment = `
  ... on sponsorsBanner_Entry {    
          id
          title
      		typeHandle
          sponsorsImages {
            title
            alt
            id
            url
          }
          sImageOne{
            title
            alt
            id
            url
          }
          SOneHyperlink{
              url
            }
          sImageTwo{
            title
            alt
            id
            url
          }
          STwoHyperlink{
              url
            }
          sImageThree{
            title
            alt
            id
            url
          }
          SThreeHyperlink{
              url
            }
  }
`;

export const tournamentSectionFragment = `
  ... on tournamentSection_Entry {
    
          id
          title
          typeHandle
          tournamentsEntries {
            id
            title
            ... on tournamentPage_Entry {
              id
              title
              slug
              flagImage {
                url
                id
                title
                alt
              }
              teamStandings {
                ... on teamScore_Entry {
                  id
                  title
                  wins
                  loses
                  teamLogo {
                    url
                    title
                    alt
                  }
                }
              }
              leagueStats {
                ... on infoCard_Entry {
                  id
                  title
                  number
                }
              }
              topPlayers {
                ... on playerCard_Entry {
                  id
                  title
                  playerName
                  playerPosition
                  cardValue
                  playerHyperlink {
                    url
                  }
                  image {
                    alt
                    id
                    url
                    title
                  }
                }
              }
            }
          }
  }
`; 

export const fixtureCardFragment = `
  id
  title
  t1Name
  t2Name
  t1t2NativeFlag
  groundsName
  date
  t1Logo {
    alt
    id
    url
    title
  }
  t2Logo {
    alt
    title
    url
    id
  }
`; 

// Fragment definitions for ground information
export const groundInfoFragment = `
  id
  homegroundStatus
  title
  address
  matches
  fbtw
  sbtw
  as1i
  as2i
  groundImageDesktop {
    alt
    id
    title
    url
  }
  groundImageMobile {
    alt
    id
    title
    url
  }
`;

export const playerDetailedCardFragment = ` 
    id
    title
    country
    scorebycaptain
    teamName
    matches
    totalruns
    wickets
    jerseyNumber
    playerid

    playerImage {
      alt
      url
      title
      id
    }
    nationalFlag {
      alt
      id
      title
      url
    } 
`;



export const tournamentYearFragment = `
  ... on tournamentYearPage_Entry {
    id
    typeHandle
    title
    slug
  }
`;

export const tournamentPageFragment = `
  ... on tournamentPage_Entry {
    id
    title
    typeHandle
    slug
    parent {
      id
      title
      slug
      typeHandle
    }
    flagImage {
      id
      title
      url
      alt
    }
    batsmanName
    batsmanImage {
      id
      title
      url
      alt
    }
    batsmanLabel
    batsmanValue
    bowlerName
    bowlerImage {
      id
      title
      url
      alt
    }
    bowlerCardLabel
    bowlerValue
    resultCards {
      ... on resultCard_Entry {
        id
        title
        lightswitch
        date
        t1Score
        t1Overs
        teamOneLogo {
          id
          title
          url
          alt
        }
        t2Score
        t2Overs
        teamTwoLogo {
          id
          title
          url
          alt
        }
      }
    }
    topPlayers {
      ... on playerCard_Entry {
        id
        title
        playerName
        image {
          id
          title
          url
          alt
        }
        cardValue
        playerPosition
        playerHyperlink {
          id
        }
      }
    }
    leagueStats {
      ... on infoCard_Entry {
        id
        title
        number
      }
    }
    teamBatting {
      ... on infoCard_Entry {
        id
        title
        number
      }
    }
    teamBowling {
      ... on infoCard_Entry {
        id
        title
        number
      }
    }
    teamStandings {
      ... on teamScore_Entry {
        id
        title
        nativeTeam
        teamLogo {
          id
          title
          url
          alt
        }
        wins
        loses
      }
    }
    battingNumberZone {
      col1
      player
      col2
      mat
      col3
      ins
      col4
      bf
      col5
      runs
      col6
      fours
      col7
      sixes
      col8
      fifties
      col9
      hundreds
      col10
      no
      col11
      hs
    }
    bowlingNumberZone {
      col1
      player
      col2
      mat
      col3
      ins
      col4
      balls
      col5
      runs
      col6
      wkts
      col7
      pts
      col8
      cths
      col9
      fourW
      col10
      fiveW
      col11
      db
    }
    fieldingNumberZone {
      col1
      player
      col2
      mat
      col3
      cths
      col4
      wc
      col5
      dr
      col6
      idr
      col7
      stm
      col8
      to
    }
    rankingZone {
      col1
      player
      col2
      battingPoints
      col3
      bowlingPoints
      col4
      fieldingPoints
      col5
      otherPoints
      col6
      total
    }
  }
`;
