import { create } from "zustand";

interface PaginationState {
  customerList: {
    currentPage: number;
    itemsPerPage: number;
  };
  activeDebtsList: {
    currentPage: number;
    itemsPerPage: number;
  };
  paidDebtsList: {
    currentPage: number;
    itemsPerPage: number;
  };
  productList: {
    currentPage: number;
    itemsPerPage: number;
  };
  transactionList: {
    currentPage: number;
    itemsPerPage: number;
  };
}

interface PaginationActions {
  setCustomerListPage: (page: number) => void;
  setCustomerListItemsPerPage: (itemsPerPage: number) => void;
  setActiveDebtsListPage: (page: number) => void;
  setActiveDebtsListItemsPerPage: (itemsPerPage: number) => void;
  setPaidDebtsListPage: (page: number) => void;
  setPaidDebtsListItemsPerPage: (itemsPerPage: number) => void;
  setProductListPage: (page: number) => void;
  setProductListItemsPerPage: (itemsPerPage: number) => void;
  setTransactionListPage: (page: number) => void;
  setTransactionListItemsPerPage: (itemsPerPage: number) => void;
}

type PaginationStore = PaginationState & PaginationActions;

export const usePaginationStore = create<PaginationStore>((set) => ({
  // Initial state
  customerList: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  activeDebtsList: {
    currentPage: 1,
    itemsPerPage: 5,
  },
  paidDebtsList: {
    currentPage: 1,
    itemsPerPage: 5,
  },
  productList: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  transactionList: {
    currentPage: 1,
    itemsPerPage: 10,
  },

  // Active Debts list actions
  setActiveDebtsListPage: (page) =>
    set((state) => ({
      activeDebtsList: { ...state.activeDebtsList, currentPage: page },
    })),
  setActiveDebtsListItemsPerPage: (itemsPerPage) =>
    set((state) => ({
      activeDebtsList: {
        ...state.activeDebtsList,
        itemsPerPage,
        currentPage: 1,
      },
    })),

  // Paid Debts list actions
  setPaidDebtsListPage: (page) =>
    set((state) => ({
      paidDebtsList: { ...state.paidDebtsList, currentPage: page },
    })),
  setPaidDebtsListItemsPerPage: (itemsPerPage) =>
    set((state) => ({
      paidDebtsList: {
        ...state.paidDebtsList,
        itemsPerPage,
        currentPage: 1,
      },
    })),

  // Customer list actions
  setCustomerListPage: (page) =>
    set((state) => ({
      customerList: { ...state.customerList, currentPage: page },
    })),
  setCustomerListItemsPerPage: (itemsPerPage) =>
    set((state) => ({
      customerList: { ...state.customerList, itemsPerPage, currentPage: 1 },
    })),
  resetCustomerListPagination: () =>
    set((state) => ({
      customerList: { ...state.customerList, currentPage: 1 },
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
      transactionList: {
        ...state.transactionList,
        itemsPerPage,
        currentPage: 1,
      },
    })),
  resetTransactionListPagination: () =>
    set((state) => ({
      transactionList: { ...state.transactionList, currentPage: 1 },
    })),
}));
