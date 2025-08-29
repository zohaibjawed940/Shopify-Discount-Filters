import { Graphql } from "@shopify/shopify-api";

import { json } from "@remix-run/node";
import { sessionStorage } from "../shopify.server";

export const loader = async () => {
  try {
    const shop = "filterskhazanay.myshopify.com";

    const sessions = await sessionStorage.findSessionsByShop(shop);

    if (!sessions || sessions.length === 0) {
      return json({ error: `No sessions found for ${shop}` }, { status: 400 });
    }

    const offlineSession = sessions.find((s) => s.isOnline === false);
    if (!offlineSession) {
      return json({ error: `No offline session found for ${shop}` }, { status: 400 });
    }

    const client = new Graphql({ session: offlineSession });

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
