"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface TourStep {
  id: string
  title: string
  content: string
  target: string
  placement?: "top" | "bottom" | "left" | "right"
  action?: () => void
}

interface DemoTourState {
  isActive: boolean
  currentStep: number
  currentTour: string | null
  completedTours: string[]
  hasSeenWelcome: boolean
  startTour: (tourId: string) => void
  nextStep: () => void
  prevStep: () => void
  endTour: () => void
  markTourComplete: (tourId: string) => void
  setWelcomeSeen: () => void
  reset: () => void
}

export const useDemoTour = create<DemoTourState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStep: 0,
      currentTour: null,
      completedTours: [],
      hasSeenWelcome: false,

      startTour: (tourId: string) => {
        set({
          isActive: true,
          currentStep: 0,
          currentTour: tourId,
        })
      },

      nextStep: () => {
        const { currentStep } = get()
        set({ currentStep: currentStep + 1 })
      },

      prevStep: () => {
        const { currentStep } = get()
        set({ currentStep: Math.max(0, currentStep - 1) })
      },

      endTour: () => {
        const { currentTour, completedTours } = get()
        const newCompletedTours =
          currentTour && !completedTours.includes(currentTour) ? [...completedTours, currentTour] : completedTours

        set({
          isActive: false,
          currentStep: 0,
          currentTour: null,
          completedTours: newCompletedTours,
        })
      },

      markTourComplete: (tourId: string) => {
        const { completedTours } = get()
        if (!completedTours.includes(tourId)) {
          set({ completedTours: [...completedTours, tourId] })
        }
      },

      setWelcomeSeen: () => {
        set({ hasSeenWelcome: true })
      },

      reset: () => {
        set({
          isActive: false,
          currentStep: 0,
          currentTour: null,
          completedTours: [],
          hasSeenWelcome: false,
        })
      },
    }),
    {
      name: "demo-tour-state",
      partialize: (state) => ({
        completedTours: state.completedTours,
        hasSeenWelcome: state.hasSeenWelcome,
      }),
    },
  ),
)
