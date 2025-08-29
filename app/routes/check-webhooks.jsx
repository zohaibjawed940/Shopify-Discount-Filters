import { json } from "@remix-run/node";
import shopify from "../shopify.server";

export const loader = async () => {
  try {
    // Replace with your actual dev store domain
    const shop = "filterskhazanay.myshopify.com";

    const session = await shopify.api.session.getOfflineSession(shop);

    if (!session) {
      return json({ error: `No offline session found for ${shop}` }, { status: 400 });
    }

    const client = new shopify.api.clients.Graphql({ session });

    const response = await client.query({
      data: `{
        webhooks(first: 10) {
          edges {
            node {
              id
              topic
              endpoint {
                __typename
                ... on WebhookHttpEndpoint { callbackUrl }
              }
            }
          }
        }
      }`,
    });

    return json(response.body.data);
  } catch (err) {
    console.error("Error in check-webhooks:", err);
    return json({ error: err.message }, { status: 500 });
  }
};