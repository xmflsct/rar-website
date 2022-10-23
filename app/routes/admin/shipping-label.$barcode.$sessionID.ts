import { json, LoaderFunction } from '@remix-run/cloudflare'
import Stripe from 'stripe'
import { Address, Customer, Message, ProductCodeDelivery } from '~/utils/postNL'

export const loader: LoaderFunction = async ({ context, params }) => {
  if (!params.barcode || !params.sessionID) {
    return json(null, 404)
  }

  const Authorization = `Bearer ${context.STRIPE_KEY_ADMIN}`
  const session = (
    await (
      await fetch(`https://api.stripe.com/v1/checkout/sessions/${params.sessionID}`, {
        headers: { Authorization }
      })
    ).json<Stripe.Checkout.Session>()
  )

  const postnlData = {
    Customer: Customer(context),
    Message,
    Shipments: [
      {
        Barcode: params.barcode,
        Addresses: [
          {
            AddressType: '01',
            ...Address(session.customer_details!)
          }
        ],
        ProductCodeDelivery
      }
    ]
  }

  const shippings = (await ((await fetch(`${context.WEBHOOK_STRIPE_POSTNL_URL}/shipment/v2_2/label`, {
    method: 'POST',
    headers: {
      apikey: context.WEBHOOK_STRIPE_POSTNL_API_KEY as string,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postnlData)
  })).json<{ ResponseShipments: { Labels: { Content: string, Labeltype: string, OutputType: string }[] }[] }>()))

  if (!shippings.ResponseShipments?.[0]?.Labels?.[0]?.Content) {
    return json(null, 500)
  }

  const base64toBlob = (base64Data: string): Blob => {
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: 'application/pdf' });
  }
  return new Response(base64toBlob(shippings.ResponseShipments[0].Labels[0].Content), { headers: { 'Content-Type': 'application/pdf' } })
}
