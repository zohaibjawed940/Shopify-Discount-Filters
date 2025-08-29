import shopify from "../shopify.server";

export async function loader() {
  try {
    // Get offline session for your shop
    const session = await shopify.session.getOfflineSession(
      "filterskhazanay.myshopify.com"
    );

    // Initialize GraphQL client
    const client = new shopify.clients.Graphql({ session });

    // Run GraphQL query
    const response = await client.query({
      data: `{
        webhookSubscriptions(first: 10) {
          edges {
            node {
              id
              topic
              endpoint {
                __typename
                ... on WebhookHttpEndpoint {
                  callbackUrl
                }
              }
            }
          }
        }
      }`,
    });

    console.log(response.body);

    return new Response(JSON.stringify(response.body), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}