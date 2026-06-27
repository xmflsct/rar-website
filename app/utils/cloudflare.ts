import { createContext, type RouterContext } from 'react-router'

type RuntimeEnv = Record<string, string | undefined> & Partial<CloudflareEnvironment>

export type CloudflareContext = {
  env: RuntimeEnv
  ctx: ExecutionContext
}

type ContextProvider = {
  get<T>(context: RouterContext<T>): T
}

type LoaderContext = ContextProvider | { cloudflare?: CloudflareContext }

export const cloudflareContext = createContext<CloudflareContext>()

export const getCloudflareContext = (
  context?: LoaderContext
): CloudflareContext | undefined => {
  if (context && 'get' in context) {
    return context.get(cloudflareContext)
  }

  return context?.cloudflare
}
