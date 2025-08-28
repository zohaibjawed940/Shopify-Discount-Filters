import { json } from "@remix-run/node";
import shopify from "../shopify.server";

export const action = async ({ request }) => {
    console.log("Webhook Fired")
  const { topic, shop, body } = await shopify.authenticate.webhook(request);

  if (topic === "PRODUCTS_UPDATE" || topic === "PRODUCTS_CREATE") {
    const product = JSON.parse(body);

    // Loop through variants (each has its own price)
    for (const variant of product.variants) {
      const price = parseFloat(variant.price);
      const compareAt = parseFloat(variant.compare_at_price);

      let discountPercent = 0;
      if (compareAt && compareAt > price) {
        discountPercent = Math.round(((compareAt - price) / compareAt) * 100);
      }

      const session = await shopify.api.session.getOfflineSession(shop);
      const client = new shopify.api.clients.Graphql({ session });

      await client.query({
        data: {
          query: `
            mutation SetDiscountMetafield($ownerId: ID!, $value: String!) {
              metafieldsSet(metafields: [{
                namespace: "custom",
                key: "discount_filter",
                type: "single_line_text_field",
                value: $value,
                ownerId: $ownerId
              }]) {
                metafields {
                  id
                  value
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            ownerId: variant.admin_graphql_api_id, // store on variant, or use product.id for product-level
            value: discountPercent.toString(),
          },
        },
      });
    }
  }

  return json({ success: true });
};
