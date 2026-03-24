import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  profile: any
  transactions: any[]
  investments: any[]
  goals: any[]
  recurring: any[]
  setProfile: (p: any) => void
  updateProfile: (p: any) => void
  setTransactions: (t: any[]) => void
  setInvestments: (i: any[]) => void
  setGoals: (g: any[]) => void
  setRecurring: (r: any[]) => void
  reset: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      transactions: [],
      investments: [],
      goals: [],
      recurring: [],
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) => set({ profile: { ...get().profile, ...updates } }),
      setTransactions: (transactions) => set({ transactions }),
      setInvestments: (investments) => set({ investments }),
      setGoals: (goals) => set({ goals }),
      setRecurring: (recurring) => set({ recurring }),
      reset: () => set({ profile: null, transactions: [], investments: [], goals: [], recurring: [] }),
    }),
    { name: 'financeapp-store', partialize: (s) => ({ profile: s.profile }) }
  )
)
