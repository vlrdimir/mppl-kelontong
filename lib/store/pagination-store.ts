import { create } from "zustand"

interface PaginationState {
  debtList: {
    currentPage: number
    itemsPerPage: number
  }
  productList: {
    currentPage: number
    itemsPerPage: number
  }
  transactionList: {
    currentPage: number
    itemsPerPage: number
  }
}

interface PaginationActions {
  setDebtListPage: (page: number) => void
  setDebtListItemsPerPage: (itemsPerPage: number) => void
  setProductListPage: (page: number) => void
  setProductListItemsPerPage: (itemsPerPage: number) => void
  setTransactionListPage: (page: number) => void
  setTransactionListItemsPerPage: (itemsPerPage: number) => void
  resetDebtListPagination: () => void
  resetProductListPagination: () => void
  resetTransactionListPagination: () => void
}

type PaginationStore = PaginationState & PaginationActions

export const usePaginationStore = create<PaginationStore>((set) => ({
  // Initial state
  debtList: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  productList: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  transactionList: {
    currentPage: 1,
    itemsPerPage: 10,
  },

  // Debt list actions
  setDebtListPage: (page) =>
    set((state) => ({
      debtList: { ...state.debtList, currentPage: page },
    })),
  setDebtListItemsPerPage: (itemsPerPage) =>
    set((state) => ({
      debtList: { ...state.debtList, itemsPerPage, currentPage: 1 },
    })),
  resetDebtListPagination: () =>
    set((state) => ({
      debtList: { ...state.debtList, currentPage: 1 },
    })),

  // Product list actions
  setProductListPage: (page) =>
    set((state) => ({
      productList: { ...state.productList, currentPage: page },
    })),
  setProductListItemsPerPage: (itemsPerPage) =>
    set((state) => ({
      productList: { ...state.productList, itemsPerPage, currentPage: 1 },
    })),
  resetProductListPagination: () =>
    set((state) => ({
      productList: { ...state.productList, currentPage: 1 },
    })),

  // Transaction list actions
  setTransactionListPage: (page) =>
    set((state) => ({
      transactionList: { ...state.transactionList, currentPage: page },
    })),
  setTransactionListItemsPerPage: (itemsPerPage) =>
    set((state) => ({
      transactionList: { ...state.transactionList, itemsPerPage, currentPage: 1 },
    })),
  resetTransactionListPagination: () =>
    set((state) => ({
      transactionList: { ...state.transactionList, currentPage: 1 },
    })),
}))
