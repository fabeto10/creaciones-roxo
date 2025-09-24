import React from "react";
import { Container, Typography, Box, Paper } from "@mui/material";
import { Payment } from "@mui/icons-material";

const PaymentManagement = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <TableCell>Tasa Cambio</TableCell>
      <TableCell>Método</TableCell>

      {/* En cada fila: */}
      <TableCell>
        {transaction.exchangeRate
          ? `${transaction.exchangeRate} BS/USD`
          : "N/A"}
      </TableCell>
      <TableCell>
        <Chip
          label={transaction.paymentMethod}
          color={
            ["ZELLE", "CRYPTO", "ZINLI", "CASH_USD"].includes(
              transaction.paymentMethod
            )
              ? "success"
              : "primary"
          }
          size="small"
        />
      </TableCell>
    </Container>
  );
};

export default PaymentManagement;
