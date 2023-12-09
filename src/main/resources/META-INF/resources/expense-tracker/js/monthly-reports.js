document.getElementById('sidebarCollapse').addEventListener('click', function () {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    var container = document.querySelector('.container');
    container.classList.toggle('active');
});

// Global API base URL
const apiBaseUrl = 'http://localhost:8080/v1/transactions';

// Function to fetch transactions for a specific month and year
function fetchMonthlyTransactions(year, month) {
    // Format the year and month into a single string 'YYYY-MM'
    const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;

    // Fetch data from the server
    fetch(`${apiBaseUrl}/${yearMonth}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            populateTransactionsTable(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Helper function to get the current year and month
function getCurrentYearMonth() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() is zero-indexed
    return { year: currentYear, month: currentMonth };
}

// Populate the transactions table with data
// Populate the transactions table with data
function populateTransactionsTable(transactions) {
    const tableBody = document.getElementById('monthly-transactions').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing rows
    transactions.forEach(transaction => {
        const row = tableBody.insertRow();

        // Set the color and symbol based on the transaction category
        let color = '';
        let symbol = '';
        if (transaction.transactionCategory === 'INCOME' || transaction.transactionCategory === 'OTHER') {
            color = 'darkgreen';
            symbol = '+ ';
        } else if (transaction.transactionCategory === 'EXPENSE' || transaction.transactionCategory === 'SUBSCRIPTION' ||
         transaction.transactionCategory === 'DEBT') {
            color = 'darkred';
            symbol = '- ';
        }

        // Apply the color and symbol to the amount
        const amountHtml = `<span style="color: ${color};">${symbol}${transaction.transactionAmount.toFixed(2)}</span>`;
        const dateAndTime = transaction.dateAndTime.replace('T', ' ');
        // Populate the row with transaction data
        row.innerHTML = `
            <td>${dateAndTime}</td>
            <td>${transaction.description}</td>
            <td>${transaction.transactionCategory}</td>
            <td>${amountHtml}</td>
            <!-- Add more cells as needed -->
        `;
    });
}

// Function to update the selected month in the <select> element
function updateSelectedMonth() {
    const { month } = getCurrentYearMonth();
    const monthSelect = document.getElementById('month-select');
    monthSelect.value = month.toString().padStart(2, '0');
}


// Event listener for month change
document.getElementById('month-select').addEventListener('change', function() {
    const selectedMonth = this.value;
    const { year } = getCurrentYearMonth();
    // Fetch transactions for the selected month
    fetchMonthlyTransactions(year, selectedMonth);
});
updateSelectedMonth();
// Initial fetch for the current month and year
const { year, month } = getCurrentYearMonth();
fetchMonthlyTransactions(year, month);


document.getElementById('download-excel').addEventListener('click', function() {
    exportTableToExcel();
});

// Function to export the table to an Excel file
function exportTableToExcel() {
    const table = document.getElementById('monthly-transactions');
    const rows = table.querySelectorAll('tr');
    const csvData = [];

    // Iterate through table rows and cells to collect data
    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            rowData.push(cell.textContent);
        });
        csvData.push(rowData.join(','));
    });

    // Create a CSV blob
    const csvContent = 'data:text/csv;charset=utf-8,' + csvData.join('\n');
    const encodedUri = encodeURI(csvContent);

    // Create a hidden anchor element to trigger the download
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'monthly_transactions.csv');
    document.body.appendChild(link);

    // Trigger the click event to initiate download
    link.click();

    // Remove the link element
    document.body.removeChild(link);
}
