package com.expense.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Data
@NoArgsConstructor
@Table(name = "TRANSACTIONS")
public class TransactionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long transactionId;
    private String description;
    private BigDecimal transactionAmount;
    private LocalDateTime dateAndTime;
    @Enumerated(EnumType.STRING)
    private TransactionCategory transactionCategory;

    @PrePersist
    public void setDateAndTime() {
        if (dateAndTime == null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            dateAndTime = LocalDateTime.parse(LocalDateTime.now().format(formatter), formatter);
        }
    }
}
