package com.expense.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardDTO {

    private BigDecimal totalBalance;
    private String currentMonth;
    private List<CategoryTotalDTO> transactionCategories;

}
