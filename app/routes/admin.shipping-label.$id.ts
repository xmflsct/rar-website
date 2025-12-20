import type { LoaderFunction } from 'react-router'
import { data } from 'react-router'
import { getMyparcelAuthHeader } from '~/utils/myparcelAuthHeader'

export const loader: LoaderFunction = async ({ context, params }) => {
  if (!params.id) {
    return data(null, { status: 404 })
  }

  const shipmentLabel = await (
    await fetch(`https://api.myparcel.nl/shipment_labels/${params.id}`, {
      headers: { ...getMyparcelAuthHeader(context), Accept: 'application/pdf' }
    })
  ).blob()

  if (!shipmentLabel) {
    return data('Cannot retrieve label PDF', { status: 500 })
  }

  return new Response(shipmentLabel, {
    headers: { 'Content-Type': 'application/pdf' }
  })
}
