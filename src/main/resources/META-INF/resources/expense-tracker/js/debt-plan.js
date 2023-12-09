document.getElementById('sidebarCollapse').addEventListener('click', function () {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    var container = document.querySelector('.container');
    container.classList.toggle('active');
});

const apiBaseUrl = 'http://localhost:8080/v1/transactions';

document.addEventListener('DOMContentLoaded', function () {

function calculateDebtReduction(income, debtCategory) {

        fetch(`${apiBaseUrl}/v1/transactions/calculate-debt?income=${income}&debtCategory=${debtCategory}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Debt Reduction:', data);
            const resultDisplay = document.getElementById('debtReductionResult');
            resultDisplay.textContent = `Debt Reduction Amount: ${data.totalAmount}`;
        })
        .catch(error => console.error('Error:', error));
    }
    document.getElementById('debtCalculationForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const income = document.getElementById('incomeInput').value;
        const debtCategory = document.getElementById('debtCategorySelect').value;
        calculateDebtReduction(income, debtCategory);
    });
});
    const debts = [
        { name: 'S/N Krediti', total: 400000, monthlyPayment: 24400 },
        { name: 'Drugo finansisko drustvo', total: 300000, monthlyPayment: 0 },
        { name: 'Halk Bank', total: 4727800, monthlyPayment: 0 },
        { name: 'UJP Taxes', total: 5900000, monthlyPayment: 16330 }
    ];

    const debtContainer = document.getElementById('debtContainer');

    debts.forEach(debt => {
        const monthsToPay = debt.monthlyPayment === 0 ? 'Pending' : `${Math.ceil(debt.total / debt.monthlyPayment)} months`;
        const yearsToPay = debt.monthlyPayment === 0 ? '' : ` (${(Math.ceil(debt.total / debt.monthlyPayment) / 12).toFixed(1)} years)`;
        const debtElement = document.createElement('div');
        debtElement.classList.add('debtItem');
        debtElement.innerHTML = `
            <div class="debtTitle">${debt.name}</div>
            <div>Total: MKD ${debt.total.toLocaleString()}</div>
            <div>Monthly Payment: MKD ${debt.monthlyPayment.toLocaleString()}</div>
            <div>Time to Pay Off: ${monthsToPay}${yearsToPay}</div>
        `;
        debtContainer.appendChild(debtElement);
    });

    const totalDebtMKD = debts.reduce((acc, debt) => acc + debt.total, 0);
        const totalDebtEuro = totalDebtMKD / 61.4;

        const totalDebtElement = document.createElement('div');
        totalDebtElement.classList.add('totalDebt');
        totalDebtElement.innerHTML = `
            <h2>Total Debt</h2>
            <p>MKD ${totalDebtMKD.toLocaleString()} (€${totalDebtEuro.toLocaleString(undefined, {maximumFractionDigits: 2})})</p>
        `;
        debtContainer.appendChild(totalDebtElement);

