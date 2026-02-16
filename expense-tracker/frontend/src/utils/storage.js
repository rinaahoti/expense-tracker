// Storage utilities for localStorage

const CATEGORIES_KEY = "et_categories";
const TRANSACTIONS_KEY = "et_transactions";

export function loadCategories() {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCategories(list) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
  } catch (error) {
    console.error("Failed to save categories:", error);
  }
}

export function loadTransactions() {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTransactions(list) {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
  } catch (error) {
    console.error("Failed to save transactions:", error);
  }
}
