package com.expense.controller;

import com.expense.entity.DashboardDTO;
import com.expense.entity.DebtCalculationDTO;
import com.expense.entity.DebtCategory;
import com.expense.entity.TransactionEntity;
import com.expense.service.TransactionService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.util.List;

@Path("/v1/transactions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TransactionController {


    private final TransactionService transactionService;

    @Inject
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GET
    public List<TransactionEntity> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    @GET
    @Path("/{yearMonth}")
    public List<TransactionEntity> getTransactionsByMonth(@PathParam("yearMonth") String yearMonth) {
        return transactionService.getTransactionsByMonth(yearMonth);
    }

    @GET
    @Path("/dashboard")
    public Response getDashboardData() {
        DashboardDTO dashboardData = transactionService.getDashboardData();
        return Response.ok(dashboardData).build();
    }

    @POST
    public Response addTransaction(TransactionEntity transaction) {
        transactionService.addTransaction(transaction.getDescription(), transaction.getTransactionAmount(), transaction.getTransactionCategory());
        return Response.status(Response.Status.CREATED).entity(transaction).build();
    }

    @POST
    @Path("/calculate-debt")
    public Response calculateDebtReduction(@QueryParam("income") BigDecimal income,
                                           @QueryParam("debtCategory") DebtCategory debtCategory) {
       DebtCalculationDTO result = transactionService.calculateDebtReduction(income, debtCategory);
        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    @PUT
    @Path("/{transactionId}")
    public Response updateTransaction(@PathParam("transactionId") Long transactionId) {
        transactionService.updateTransaction(transactionId);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{transactionId}")
    public Response deleteTransaction(@PathParam("transactionId") Long transactionId) {
        transactionService.deleteTransaction(transactionId);
        return Response.ok().build();
    }

}
