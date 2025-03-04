// DOM Elements
const expenseNameInput = document.getElementById('expenseName');
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseCategoryInput = document.getElementById('expenseCategory');
const expenseDateInput = document.getElementById('expenseDate');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const expenseListEl = document.getElementById('expenseList');
const emptyStateEl = document.getElementById('emptyState');
const totalAmountEl = document.getElementById('totalAmount');
const monthlyAmountEl = document.getElementById('monthlyAmount');
const averageAmountEl = document.getElementById('averageAmount');
const expenseChartEl = document.getElementById('expenseChart');
const linkWalletBtn = document.getElementById('linkWalletBtn');
const exportDataBtn = document.getElementById('exportDataBtn');
const themeToggleEl = document.getElementById('themeToggle');

// Initialize expenses array from localStorage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let expenseChart = null;

// Initialize date input with current date
expenseDateInput.valueAsDate = new Date();

// Event Listeners
addExpenseBtn.addEventListener('click', addExpense);
linkWalletBtn.addEventListener('click', linkWallet);
exportDataBtn.addEventListener('click', exportData);
themeToggleEl.addEventListener('change', toggleTheme);

// Initialize app
window.addEventListener('load', initializeApp);

function initializeApp() {
  updateExpenseList();
  updateSummary();
  updateChart();
  
  // Initialize theme based on user preference
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  themeToggleEl.checked = prefersDarkMode;
  
  if (prefersDarkMode) {
    document.documentElement.classList.add('dark-theme');
  }
}

// Add new expense
function addExpense() {
  // Validate inputs
  if (!expenseNameInput.value.trim()) {
    alert('Please enter an expense name');
    expenseNameInput.focus();
    return;
  }
  
  if (!expenseAmountInput.value || expenseAmountInput.value <= 0) {
    alert('Please enter a valid amount');
    expenseAmountInput.focus();
    return;
  }
  
  // Create new expense object
  const newExpense = {
    id: Date.now(),
    name: expenseNameInput.value.trim(),
    amount: parseFloat(expenseAmountInput.value),
    category: expenseCategoryInput.value,
    date: expenseDateInput.value,
    timestamp: new Date().toISOString()
  };
  
  // Add to expenses array
  expenses.unshift(newExpense);
  
  // Save to localStorage
  saveExpenses();
  
  // Update UI
  updateExpenseList();
  updateSummary();
  updateChart();
  
  // Reset form
  expenseNameInput.value = '';
  expenseAmountInput.value = '';
  expenseNameInput.focus();
  
  // Show confirmation
  showNotification('Expense added successfully!');
}

// Update expense list
function updateExpenseList() {
  // Clear current list
  expenseListEl.innerHTML = '';
  
  if (expenses.length === 0) {
    expenseListEl.appendChild(emptyStateEl);
    return;
  }
  
  // Create expense items
  expenses.forEach(expense => {
    const expenseItem = document.createElement('div');
    expenseItem.className = 'expense-item';
    
    const expenseDate = new Date(expense.date);
    const formattedDate = expenseDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    expenseItem.innerHTML = `
      <div class="expense-info">
        <span class="expense-name">${expense.name}</span>
        <span class="expense-category">${getCategoryName(expense.category)}</span>
      </div>
      <span class="expense-date">${formattedDate}</span>
      <span class="expense-amount">₹${expense.amount.toFixed(2)}</span>
      <div class="expense-actions">
        <button class="btn-icon" data-id="${expense.id}" data-action="edit">✏️</button>
        <button class="btn-icon" data-id="${expense.id}" data-action="delete">🗑️</button>
      </div>
    `;
    
    expenseListEl.appendChild(expenseItem);
  });
  
  // Add event listeners to action buttons
  document.querySelectorAll('.btn-icon[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', () => editExpense(parseInt(btn.dataset.id)));
  });
  
  document.querySelectorAll('.btn-icon[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => deleteExpense(parseInt(btn.dataset.id)));
  });
}

// Get readable category name
function getCategoryName(category) {
  const categories = {
    food: 'Food & Dining',
    transportation: 'Transportation',
    utilities: 'Utilities',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    healthcare: 'Healthcare',
    education: 'Education',
    other: 'Other'
  };
  
  return categories[category] || 'Other';
}

// Update summary statistics
function updateSummary() {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmountEl.textContent = totalAmount.toFixed(2);
  
  // Calculate monthly expenses
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= firstDayOfMonth;
  });
  
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  monthlyAmountEl.textContent = monthlyTotal.toFixed(2);
  
  // Calculate daily average
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = Math.min(today.getDate(), daysInCurrentMonth);
  const dailyAverage = monthlyTotal / currentDay;
  
  averageAmountEl.textContent = dailyAverage.toFixed(2);
}

// Update chart
function updateChart() {
  const ctx = expenseChartEl.getContext('2d');
  
  // Group expenses by category
  const categoryTotals = {};
  expenses.forEach(expense => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += expense.amount;
  });
  
  // Prepare data for chart
  const labels = Object.keys(categoryTotals).map(category => getCategoryName(category));
  const data = Object.values(categoryTotals);
  
  // Destroy existing chart if it exists
  if (expenseChart) {
    expenseChart.destroy();
  }
  
  // Create new chart
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#ef4444', // red
          '#f97316', // orange
          '#f59e0b', // amber
          '#84cc16', // lime
          '#10b981', // emerald
          '#06b6d4', // cyan
          '#3b82f6', // blue
          '#8b5cf6'  // violet
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

// Edit expense
function editExpense(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;
  
  // Fill form with expense data
  expenseNameInput.value = expense.name;
  expenseAmountInput.value = expense.amount;
  expenseCategoryInput.value = expense.category;
  expenseDateInput.value = expense.date;
  
  // Remove the expense from the array
  deleteExpense(id, false);
  
  // Focus on the form
  expenseNameInput.focus();
}

// Delete expense
function deleteExpense(id, showConfirm = true) {
  if (showConfirm && !confirm('Are you sure you want to delete this expense?')) {
    return;
  }
  
  // Filter out the expense with the given id
  expenses = expenses.filter(expense => expense.id !== id);
  
  // Save to localStorage
  saveExpenses();
  
  // Update UI
  updateExpenseList();
  updateSummary();
  updateChart();
  
  if (showConfirm) {
    showNotification('Expense deleted successfully!');
  }
}

// Save expenses to localStorage
function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Link with UPI/GPay
function linkWallet() {
  alert('This feature would connect to UPI/GPay in a real application. Currently just a placeholder.');
}

// Export data as CSV
function exportData() {
  if (expenses.length === 0) {
    alert('No expenses to export');
    return;
  }
  
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Name,Amount,Category,Date\n';
  
  expenses.forEach(expense => {
    csvContent += `${expense.name},${expense.amount},${getCategoryName(expense.category)},${expense.date}\n`;
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'expense_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Show notification
function showNotification(message) {
  // In a real app, this would be a nicer notification system
  alert(message);
}

// Toggle theme
function toggleTheme() {
  if (themeToggleEl.checked) {
    document.documentElement.classList.add('dark-theme');
  } else {
    document.documentElement.classList.remove('dark-theme');
  }
}
