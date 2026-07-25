import type { LoaderFunctionArgs } from 'react-router'
import { data } from 'react-router'
import { getMyparcelAuthHeader } from '~/utils/myparcelAuthHeader'

export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
  if (!params.id || !/^\d+$/.test(params.id)) {
    return data(null, { status: 404 })
  }

  const response = await fetch(
    `https://api.myparcel.nl/shipment_labels/${encodeURIComponent(params.id)}`,
    {
      headers: {
        ...getMyparcelAuthHeader(context, request),
        Accept: 'application/pdf'
      }
    }
  )
  if (!response.ok) {
    return data('Cannot retrieve label PDF', {
      status: response.status === 404 ? 404 : 502,
      headers: { 'Cache-Control': 'private, no-store' }
    })
  }

  return new Response(response.body, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'application/pdf',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
