// app/routes/webhooks.jsx
import { json } from "@remix-run/node";
import shopify from "../shopify.server"; // your shopifyApi instance

export async function loader() {
  try {
    // Get an offline session for your shop
    const session = await shopify.sessionStorage.loadSession(
      `offline_filterskhazanay.myshopify.com`
    );

    if (!session) {
      throw new Error("No offline session found for filterskhazanay.myshopify.com");
    }

    // Create GraphQL client
    const client = new shopify.clients.Graphql({ session });

    // Query active webhooks
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

    return json(response.body);
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return json({ error: error.message }, { status: 500 });
  }
}