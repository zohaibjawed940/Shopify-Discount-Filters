// app/routes/webhooks.jsx
import { json } from "@remix-run/node";
import shopify from "../shopify.server"; // adjust path if needed

export async function loader() {
  try {
    // Get the offline session for your shop
    const session = await shopify.sessionStorage.loadSession(
      `offline_filterskhazanay.myshopify.com`
    );

    if (!session) {
      return json({ error: "No offline session found" }, { status: 400 });
    }

    // GraphQL client
    const client = new shopify.clients.Graphql({ session });

    // Fetch webhook subscriptions
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
    console.error(error);
    return json({ error: error.message }, { status: 500 });
  }
}