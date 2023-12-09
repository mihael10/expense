package com.expense.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CategoryTotalDTO {

    private final TransactionCategory category;
    private final BigDecimal totalAmount;

}
