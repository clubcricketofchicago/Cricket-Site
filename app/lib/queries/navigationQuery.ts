export function getNavigationConfig() {
  return `
    query MyQuery {
      entries(section: "navigation") {
        id
        ... on navigationElement_Entry {
          id
          title
          hyperlink {
            id
            url
          }
          buttonToggle
          navigationIcon{
            id
            title
            alt
            url
          }
        }
      }
    }



  `;
} 