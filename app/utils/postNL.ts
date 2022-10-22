import { AppLoadContext } from "@remix-run/cloudflare";

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

export const Message = { Printertype: 'GraphicFile|PDF' }

export const ProductCodeDelivery = '3085'