import { AppLoadContext } from "@remix-run/cloudflare";
import Stripe from "stripe";

export const Customer = (context: AppLoadContext) => ({
  Address: {
    AddressType: '02',
    Countrycode: 'NL',
    City: 'Rotterdam',
    Zipcode: '3011PG',
    StreetHouseNrExt: 'Hoogstraat 55A',
    CompanyName: 'Round&Round'
  },
  CustomerCode: context.WEBHOOK_STRIPE_POSTNL_CUSTOMER_CODE,
  CustomerNumber: context.WEBHOOK_STRIPE_POSTNL_CUSTOMER_NUMBER,
  CollectionLocation: context.WEBHOOK_STRIPE_POSTNL_COLLECTION_LOCATION,
  Email: 'info@roundandround.nl'
})

export const Address = (customer_details: Stripe.Checkout.Session.CustomerDetails | null) => ({
  Countrycode: customer_details?.address?.country,
  City: customer_details?.address?.city,
  Zipcode: customer_details?.address?.postal_code,
  StreetHouseNrExt:
    customer_details?.address?.line1 +
    (customer_details?.address?.line2 ? `\n${customer_details?.address?.line2}` : ''),
  Name: customer_details?.name
})

export const Message = { Printertype: 'GraphicFile|PDF' }

export const ProductCodeDelivery = '3085'