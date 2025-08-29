import { json } from "@remix-run/node";
import shopify from "../shopify.server"; // adjust path if needed

export const loader = async () => {
  try {
    // Get offline session for your shop
    const session = await shopify.api.session.getOfflineSession(
      "filterskhazanay.myshopify.com"
    );

    // Initialize GraphQL client
    const client = new shopify.clients.Graphql({ session });

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

    console.log("Webhook subscriptions:", response.body);

    return json(response.body);
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return json({ error: error.message }, { status: 500 });
  }
};