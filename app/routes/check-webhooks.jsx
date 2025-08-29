import { GraphqlClient } from "@shopify/shopify-api"; 
import shopify from "../shopify.server"; // adjust path if needed

export default async function getWebhooks() {
  try {
    // Get offline session for your shop
    const session = await shopify.sessionStorage.loadSession(
      `offline_filterskhazanay.myshopify.com`
    );

    if (!session) {
      throw new Error("No offline session found for filterskhazanay.myshopify.com");
    }

    // Create GraphQL client
    const client = new GraphqlClient({
      session,
    });

    // Run query
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
    return Response.json(response.body);
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}