export async function fetchGraphQL(query, variables = {}) {
  try {
    const response = await fetch('http://cms.ccc.clubcricketofchicago.com/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error! Status: ${response.status}, ${errorText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(`GraphQL Error: ${result.errors[0].message}`);
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching from GraphQL API:', error);
    throw error;
  }
}
