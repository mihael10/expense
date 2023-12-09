// ------------------------
// Initialization
// ------------------------

let incomeChart; // Declare incomeChart globally

document.addEventListener('DOMContentLoaded', () => {
    initIncomeChart();
    fetchTransactionsAndUpdateChart();
});

document.getElementById('sidebarCollapse').addEventListener('click', function () {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    var container = document.querySelector('.container');
    container.classList.toggle('active');
});




// ------------------------
// Chart Initialization
// ------------------------

function initIncomeChart() {
    const incomeChartCtx = document.getElementById('incomeChart').getContext('2d');
    if (incomeChartCtx) { // Make sure the context is not null
        incomeChart = new Chart(incomeChartCtx, {
            type: 'pie',
            data: {
                labels: ['INCOME', 'EXPENSE', 'DEBT', 'OTHER'],
                datasets: [{
                    label: 'Categories',
                    data: [0, 0, 0, 0], // Initialize with zeros or actual data if available
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(201, 203, 207, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(201, 203, 207, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else {
        console.error('Cannot find context for income chart');
    }
}


// ------------------------
// Transaction Functions
// ------------------------

function updateTotalBalance(transactions) {
    // Initialize totals for each category
    let incomeTotal = 0;
    let expenseTotal = 0;
    let debtTotal = 0;
    let otherTotal = 0;

    // Iterate over transactions to sum amounts by category
    transactions.forEach(transaction => {
        let amount = parseFloat(transaction.transactionAmount);
        if (!isNaN(amount)) {
            switch (transaction.transactionCategory) {
                case 'INCOME':
                    incomeTotal += amount;
                    break;
                case 'EXPENSE':
                    expenseTotal += amount;
                    break;
                case 'DEBT':
                    debtTotal += amount;
                    break;
                case 'OTHER':
                    otherTotal += amount;
                    break;
            }
        }
    });

    // Update the display for each category
    document.getElementById('total-income').textContent = `MKD ${incomeTotal.toFixed(2)}`;
    document.getElementById('total-expense').textContent = `MKD ${expenseTotal.toFixed(2)}`;
    document.getElementById('total-debt').textContent = `MKD ${debtTotal.toFixed(2)}`;
    document.getElementById('total-other').textContent = `MKD ${otherTotal.toFixed(2)}`;

    totalBalance = incomeTotal - expenseTotal;
    document.getElementById('total-balance').textContent = `MKD ${totalBalance.toFixed(2)}`;
}

async function fetchTransactionsAndUpdateChart() {
    try {
        const response = await fetch(`${apiBaseUrl}`);
        const data = await response.json();
        displayTransactions(data);
        updateChartData(data);
        updateTotalBalance(data);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

function updateChartData(transactions) {
    const totals = calculateCategoryTotals(transactions);

    // Update the chart data
    if (incomeChart) {
        incomeChart.data.datasets[0].data = [
            totals.income,
            totals.expense,
            totals.debt,
            totals.other
        ];
        incomeChart.update();
    } else {
        console.error('Income chart is not initialized');
    }

    updateTotalDisplays(totals);
}

function calculateCategoryTotals(transactions) {
    const totals = { income: 0, expense: 0, debt: 0, other: 0, subscription: 0 };

    transactions.forEach(transaction => {
        let amount = parseFloat(transaction.transactionAmount);
        if (!isNaN(amount)) {
            switch (transaction.transactionCategory.toUpperCase()) { // Ensure the case matches
                case 'INCOME':
                    totals.income += amount;
                    break;
                case 'EXPENSE':
                    totals.expense += amount;
                    break;
                case 'DEBT':
                    totals.debt += amount;
                    break;
                case 'OTHER':
                    totals.other += amount;
                    break;
                case 'SUBSCRIPTION':
                    totals.expense += amount;
//                    totals.subscription += amount;
                    break;
                default:
                    console.error('Unknown category: ', transaction.transactionCategory);
            }
        } else {
            console.error('Invalid amount for transaction: ', transaction.transactionAmount);
        }
    });

    return totals;
}

function calculateProjectedIncome(totalBalance, otherTotal) {
    return totalBalance + otherTotal;
}

// Update the "Projected Income" element in the HTML
function updateProjectedIncome() {
    const totalBalance = parseFloat(document.getElementById('total-balance').textContent.replace('MKD ', ''));
    const otherTotal = parseFloat(document.getElementById('total-other').textContent.replace('MKD ', ''));
    const projectedIncome = calculateProjectedIncome(totalBalance, otherTotal);
    document.getElementById('projected-total-income').textContent = `MKD ${projectedIncome.toFixed(2)}`;
}



function updateTotalDisplays(totals) {
    // Check if the properties exist and are numbers before calling .toFixed()
    const totalIncome = totals.income ? `<span style="color: darkgreen;">${totals.income.toFixed(2)}</span>` : '<span style="color: darkgreen;">+0.00</span>';
    const totalExpense = totals.expense ? `<span style="color: darkred;">${totals.expense.toFixed(2)}</span>` : '<span style="color: darkred;">-0.00</span>';
    const totalDebt = totals.debt ? `<span style="color: darkred;">${totals.debt.toFixed(2)}</span>` : '<span style="color: darkred;">-0.00</span>';
    const totalOther = totals.other ? `<span style="color: darkgreen;">${totals.other.toFixed(2)}</span>` : '<span style="color: darkgreen;">+0.00</span>';
    const totalSubscription = totals.subscription ? `<span style="color: darkred;">${totals.subscription.toFixed(2)}</span>` : '<span style="color: darkred;">-0.00</span>';

    document.getElementById('total-income').innerHTML = `MKD ${totalIncome}`;
    document.getElementById('total-expense').innerHTML = `MKD ${totalExpense}`;
    document.getElementById('total-debt').innerHTML = `MKD ${totalDebt}`;
    document.getElementById('total-other').innerHTML = `MKD ${totalOther}`;

    const totalBalance = (totals.income - totals.expense - totals.subscription).toFixed(2);
    const totalBalanceDisplay = totalBalance >= 0 ? `<span style="color: darkgreen;">${totalBalance}</span>` : `<span style="color: darkred;">-${Math.abs(totalBalance)}</span>`;
    document.getElementById('total-balance').innerHTML = `MKD ${totalBalanceDisplay}`;
    updateProjectedIncome();
}


// ------------------------
// Form Submission
// ------------------------

document.getElementById('transaction-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const description = document.getElementById('transaction-name').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const category = document.getElementById('transaction-category').value;
    await addTransaction(description, amount, category);
    fetchTransactionsAndUpdateChart();
});

async function addTransaction(description, amount, category, dateAndTime) {

    const transactionData = {
        description,
        transactionAmount: amount,
        dateAndTime: dateAndTime,
        transactionCategory: category
    };

    try {
        const response = await fetch(`${apiBaseUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    } catch (error) {
        console.error('Error adding transaction:', error);
    }
}

// ------------------------
// Display Functions
// ------------------------


function displayTransactions(transactions) {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    transactions.forEach(transaction => {
        let row = transactionList.insertRow();
        let idCell = row.insertCell(0);
        let categoryCell = row.insertCell(1);
        let amountCell = row.insertCell(2);
        let descriptionCell = row.insertCell(3);
        let dateCell = row.insertCell(4);
        let actionsCell = row.insertCell(5);

        idCell.textContent = transaction.transactionId;
        categoryCell.textContent = transaction.transactionCategory;

        // Format the amount with color and symbol based on the category
        let formattedAmount = '';
        if (transaction.transactionCategory === 'INCOME' || transaction.transactionCategory === 'OTHER') {
            formattedAmount = `<span style="color: darkgreen;">+ ${transaction.transactionAmount.toFixed(2)}</span>`;
        } else if (transaction.transactionCategory === 'EXPENSE' || transaction.transactionCategory === 'DEBT' || transaction.transactionCategory === 'SUBSCRIPTION') {
            formattedAmount = `<span style="color: darkred;">- ${transaction.transactionAmount.toFixed(2)}</span>`;
        }
        amountCell.innerHTML = formattedAmount;

        descriptionCell.textContent = transaction.description;
        dateCell.textContent = transaction.dateAndTime.replace('T', ' ');

        // Add edit icon
        let editIcon = document.createElement('i');
        editIcon.className = 'fa fa-pencil';
        editIcon.style.cursor = 'pointer';
        editIcon.addEventListener('click', () => editTransaction(transaction.transactionId));
        actionsCell.appendChild(editIcon);

        // Add space between icons
        actionsCell.appendChild(document.createTextNode(' '));

        // Add delete icon
        let deleteIcon = document.createElement('i');
        deleteIcon.className = 'fa fa-trash';
        deleteIcon.style.color = 'red';
        deleteIcon.style.cursor = 'pointer';
        deleteIcon.addEventListener('click', () => confirmDelete(transaction.transactionId));
        actionsCell.appendChild(deleteIcon);
    });
}

function editTransaction(transactionId) {
    // Logic to handle editing a transaction
    console.log('Editing transaction', transactionId);
    // You might want to show a form to edit the transaction or navigate to a different view/page
}

function confirmDelete(transactionId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        deleteTransaction(transactionId);
    }
}

async function deleteTransaction(transactionId) {
    try {
        const response = await fetch(`${apiBaseUrl}/${transactionId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Optionally, refresh the list after deletion
        fetchTransactionsAndUpdateChart();
    } catch (error) {
        console.error('Error deleting transaction:', error);
    }
}
// ------------------------
// API Base URL
// ------------------------

// Replace with your actual API endpoint
const apiBaseUrl = 'http://localhost:8080/v1/transactions';