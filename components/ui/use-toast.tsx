"use client"

import type React from "react"

import { useState, createContext, useContext } from "react"

type ToastType = "default" | "destructive" | "success"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 md:max-w-[420px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex w-full items-center justify-between rounded-lg border p-4 shadow-lg ${
              toast.variant === "destructive"
                ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-50"
                : toast.variant === "success"
                  ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-50"
                  : "border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
            }`}
          >
            <div className="grid gap-1">
              <h4 className="font-medium">{toast.title}</h4>
              {toast.description && <p className="text-sm">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return {
    toast: context.addToast,
    dismiss: context.removeToast,
  }
}

export function Toaster() {
  return null // The actual toasts are rendered by the ToastProvider
}

