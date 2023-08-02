import { json, LoaderFunction } from '@remix-run/cloudflare'
import { getMyparcelAuthHeader } from '~/utils/myparcelAuthHeader'

export const loader: LoaderFunction = async ({ context, params }) => {
  if (!params.id) {
    return json(null, 404)
  }

  const shipmentLabel = await (
    await fetch(`https://api.myparcel.nl/shipment_labels/${params.id}?format=a6`, {
      headers: { ...getMyparcelAuthHeader(context), Accept: 'application/pdf' }
    })
  ).blob()

  if (!shipmentLabel) {
    return json('Cannot retrieve label PDF', 500)
  }

  return new Response(shipmentLabel, {
    headers: { 'Content-Type': 'application/pdf' }
  })
}
