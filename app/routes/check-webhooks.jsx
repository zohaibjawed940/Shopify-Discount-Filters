import { json } from "@remix-run/node";
import shopify from "../shopify.server"; // your initialized shopifyApi

export const loader = async () => {
  try {
    // Load the offline session for your shop
    const session = await shopify.sessionStorage.loadSession(
      `offline_filterskhazanay.myshopify.com`
    );

    if (!session) {
      return json({ error: "No offline session found" }, { status: 400 });
    }

    // Use the GraphQL client
    const client = new shopify.clients.Graphql({ session });

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
    console.error("Error in webhooks loader:", error);
    return json({ error: error.message }, { status: 500 });
  }
};