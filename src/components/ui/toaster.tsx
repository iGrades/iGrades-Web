"use client"

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react"

const baseToaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
})

// Wrap create in setTimeout to prevent "flushSync was called from inside a lifecycle method" in React 18/19
const safeCreate = (options: Parameters<typeof baseToaster.create>[0]) => {
  if (typeof window !== "undefined") {
    setTimeout(() => {
      baseToaster.create(options)
    }, 0)
    return options?.id || ""
  }
  return baseToaster.create(options)
}

export const toaster = new Proxy(baseToaster, {
  get(target, prop, receiver) {
    if (prop === "create") {
      return safeCreate
    }
    const val = Reflect.get(target, prop, receiver)
    if (typeof val === "function") {
      return val.bind(target)
    }
    return val
  },
})

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={baseToaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root width={{ md: "sm" }}>
            {toast.type === "loading" ? (
              <Spinner size="sm" color="blue.solid" />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}

