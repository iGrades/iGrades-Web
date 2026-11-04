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
  placement: "top",
  pauseOnPageIdle: true,
  offsets: {
    top: "16px",
    bottom: "16px",
    left: "16px",
    right: "16px",
  },
})

// Wrap create in setTimeout to prevent "flushSync was called from inside a lifecycle method" in React 18/19
const safeCreate = (options: Parameters<typeof baseToaster.create>[0]) => {
  if (typeof window !== "undefined") {
    setTimeout(() => {
      baseToaster.create({
        duration: 4000,
        ...options,
      })
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
          <Toast.Root
            width={{ base: "calc(100vw - 32px)", sm: "420px" }}
            maxW="480px"
            p={{ base: 4, sm: 4.5 }}
            borderRadius="2xl"
            bg="white"
            boxShadow="0 16px 45px rgba(0, 0, 0, 0.16), 0 4px 16px rgba(0, 0, 0, 0.08)"
            border="1.5px solid"
            borderColor="gray.100"
            color="gray.900"
            my={2}
          >
            {toast.type === "loading" ? (
              <Spinner size="md" color="blue.solid" />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && (
                <Toast.Title
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0F172A",
                    lineHeight: "1.25",
                  }}
                >
                  {toast.title}
                </Toast.Title>
              )}
              {toast.description && (
                <Toast.Description
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#475569",
                    lineHeight: "1.4",
                  }}
                >
                  {toast.description}
                </Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            <Toast.CloseTrigger />
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
