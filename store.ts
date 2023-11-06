import { create } from 'zustand'

type storeProperties = {
    logs: { type: string, message: string }[],
    addLog: (data: any) => void,
    clearLogs: () => void,
}

const useStore = create<storeProperties>((set) => ({
    logs: [],
    addLog: (data) => set((state) => ({ logs: [...state.logs, data] })),
    clearLogs: () => set({ logs: [] }),
}))

export default useStore