import { json } from "@remix-run/node";
import shopify from "../shopify.server";

export const loader = async () => {
  const session = await shopify.api.session.getOfflineSession("{filterskhazanay}.myshopify.com");
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

  console.log("Webhooks:", JSON.stringify(response.body.data, null, 2));

  return json(response.body.data);
};
