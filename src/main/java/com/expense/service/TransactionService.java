package com.expense.service;

import com.expense.entity.*;
import com.expense.repository.TransactionRepository;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class TransactionService {


    private final TransactionRepository transactionRepository;

    @Inject
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<TransactionEntity> getAllTransactions() {
        return transactionRepository.listAll();
    }

    @Transactional
    public void addTransaction(String description, BigDecimal amount, TransactionCategory category) {
        TransactionEntity transaction = new TransactionEntity();
        transaction.setDescription(description);
        transaction.setTransactionAmount(amount);
        transaction.setDateAndTime(transaction.getDateAndTime());
        transaction.setTransactionCategory(category);
        transactionRepository.persist(transaction);
    }

    @Transactional
    public List<TransactionEntity> getTransactionsByMonth(String yearMonth) {
        LocalDate firstDayOfMonth = LocalDate.parse(yearMonth + "-01");
        LocalDate lastDayOfMonth = firstDayOfMonth.withDayOfMonth(firstDayOfMonth.lengthOfMonth());
        return transactionRepository.findTransactionsByDateRange(firstDayOfMonth, lastDayOfMonth);
    }

    @Transactional
    public void updateTransaction(Long transactionId) {
        TransactionEntity transaction = transactionRepository.findById(transactionId);
        if (transaction != null) {
            transaction.setDescription(transaction.getDescription());
            transaction.setTransactionAmount(transaction.getTransactionAmount());
            transaction.setTransactionCategory(transaction.getTransactionCategory());
            transaction.setDateAndTime(transaction.getDateAndTime());
            transactionRepository.persist(transaction);
        } else {
            throw new IllegalArgumentException("Transaction with ID " + transactionId + " not found");
        }
    }
    @Transactional
    public void deleteTransaction(Long transactionId) {
        TransactionEntity transaction = transactionRepository.findById(transactionId);
        if (transaction != null) {
            transactionRepository.delete(transaction);
        } else {
            throw new IllegalArgumentException("Transaction with ID " + transactionId + " not found");
        }
    }

    @Transactional
    public DebtCalculationDTO calculateDebtReduction(BigDecimal income, DebtCategory debtCategory) {
        BigDecimal reducedAmount = income;
        if (debtCategory == DebtCategory.SN || debtCategory == DebtCategory.UJP_TAXES) {
            BigDecimal reductionFactor = BigDecimal.valueOf(0.333);
            reducedAmount = income.subtract(income.multiply(reductionFactor));

            // Additional calculation for UJP_TAXES
            if (debtCategory == DebtCategory.UJP_TAXES) {
                reducedAmount = reducedAmount.subtract(reducedAmount.multiply(reductionFactor));
            }
        }
        DebtCalculationDTO debtCalculationDTO = new DebtCalculationDTO();
        debtCalculationDTO.setTotalAmount(reducedAmount);

        return debtCalculationDTO;
    }

    @Transactional
    public DashboardDTO getDashboardData() {
        DashboardDTO dashboardData = new DashboardDTO();

        // Calculate total balance (INCOME - SUBSCRIPTION - EXPENSES)
        BigDecimal totalIncome = getTotalAmountByCategory(TransactionCategory.INCOME);
        BigDecimal totalSubscription = getTotalAmountByCategory(TransactionCategory.SUBSCRIPTION);
        BigDecimal totalExpenses = getTotalAmountByCategory(TransactionCategory.EXPENSE);

        BigDecimal totalBalance = totalIncome.subtract(totalSubscription).subtract(totalExpenses);
        dashboardData.setTotalBalance(totalBalance);

        // Set current month
        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM yyyy"));
        dashboardData.setCurrentMonth(currentMonth);

        // Fetch transaction categories
        List<CategoryTotalDTO> transactionCategories = getTransactionCategories();
        dashboardData.setTransactionCategories(transactionCategories);


        return dashboardData;
    }

    @Scheduled(cron="0 0 0 L * ?") // This cron expression represents last day of every month at midnight
    public void transferBalanceToSavings() {
        LocalDate lastDayOfCurrentMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
        if(LocalDate.now().equals(lastDayOfCurrentMonth)) {
            // Logic to transfer totalBalance to totalSavings
            // This can include fetching the current balance, updating the savings account, etc.
            // Ensure to handle any data consistency and transactional integrity
        }
    }

    private BigDecimal getTotalAmountByCategory(TransactionCategory category) {
        List<TransactionEntity> transactions = transactionRepository.findByCategory(category);
        return transactions.stream()
                .map(TransactionEntity::getTransactionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    private List<CategoryTotalDTO> getTransactionCategories() {
        Map<TransactionCategory, BigDecimal> totalAmountsByCategory = transactionRepository.getTotalAmountByCategory();
        return totalAmountsByCategory.entrySet().stream()
                .map(entry -> new CategoryTotalDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

}
