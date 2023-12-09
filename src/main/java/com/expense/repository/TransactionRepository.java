package com.expense.repository;

import com.expense.entity.TransactionCategory;
import com.expense.entity.TransactionEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class TransactionRepository implements PanacheRepository<TransactionEntity> {

    public List<TransactionEntity> findTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        String jpql = "SELECT t FROM TransactionEntity t WHERE t.dateAndTime >= :startDate AND t.dateAndTime <= :endDate";
        TypedQuery<TransactionEntity> query = getEntityManager().createQuery(jpql, TransactionEntity.class);
        query.setParameter("startDate", startDate.atStartOfDay());
        query.setParameter("endDate", endDate.atTime(23, 59, 59)); // End of the day
        return query.getResultList();
    }

    public List<TransactionEntity> findByCategory(TransactionCategory category) {
        String jpql = "SELECT t FROM TransactionEntity t WHERE t.transactionCategory = :category";
        TypedQuery<TransactionEntity> query = getEntityManager().createQuery(jpql, TransactionEntity.class);
        query.setParameter("category", category);
        return query.getResultList();
    }
    public Map<TransactionCategory, BigDecimal> getTotalAmountByCategory() {
        String jpql = "SELECT t.transactionCategory, SUM(t.transactionAmount) FROM TransactionEntity t GROUP BY t.transactionCategory";
        TypedQuery<Tuple> query = getEntityManager().createQuery(jpql, Tuple.class);
        List<Tuple> results = query.getResultList();

        Map<TransactionCategory, BigDecimal> totalAmountsByCategory = new HashMap<>();
        for (Tuple result : results) {
            TransactionCategory category = (TransactionCategory) result.get(0);
            BigDecimal totalAmount = (BigDecimal) result.get(1);
            totalAmountsByCategory.put(category, totalAmount);
        }

        return totalAmountsByCategory;
    }

}
