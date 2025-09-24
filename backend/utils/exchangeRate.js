export class ExchangeRateService {
  static async getOfficialRate() {
    try {
      const response = await fetch(
        "https://ve.dolarapi.com/v1/dolares/oficial"
      );
      const data = await response.json();
      console.log("✅ Tasa oficial obtenida:", data.promedio);
      return data.promedio || 170;
    } catch (error) {
      console.error("❌ Error obteniendo tasa oficial:", error);
      return 170;
    }
  }

  static async getParallelRate() {
    try {
      const response = await fetch(
        "https://ve.dolarapi.com/v1/dolares/paralelo"
      );
      const data = await response.json();
      console.log("✅ Tasa paralela obtenida:", data.promedio);
      return data.promedio || 280;
    } catch (error) {
      console.error("❌ Error obteniendo tasa paralela:", error);
      return 280;
    }
  }

  static async calculatePriceInBolivares(amountUSD, method) {
    try {
      console.log(
        `📊 Calculando precio para ${amountUSD} USD con método: ${method}`
      );

      const [officialRate, parallelRate] = await Promise.all([
        this.getOfficialRate(),
        this.getParallelRate(),
      ]);

      console.log(
        `💱 Tasas - Oficial: ${officialRate}, Paralela: ${parallelRate}`
      );

      // Métodos que pagan en USD directamente (Zelle, Crypto, Zinli, Efectivo USD)
      const usdMethods = ["ZELLE", "CRYPTO", "ZINLI", "CASH_USD"];

      if (usdMethods.includes(method)) {
        // Cuando pagas en USD directo, el ahorro es vs pagar en BS a tasa paralela
        const amountBSParallel = amountUSD * parallelRate;
        const amountBSOfficial = amountUSD * officialRate;

        // El ahorro es la diferencia entre lo que pagarías en BS a paralelo vs oficial
        const savingsAmount = amountBSParallel - amountBSOfficial;
        const savingsPercentage = (
          (savingsAmount / amountBSParallel) *
          100
        ).toFixed(1);

        console.log(
          `💰 Ahorro calculado: ${savingsPercentage}% (${savingsAmount.toFixed(
            2
          )} BS)`
        );

        return {
          amountUSD,
          amountBS: null, // No se paga en BS
          rate: null,
          savings: {
            parallelRate,
            officialRate,
            savingsAmount,
            savingsPercentage,
            explanation: `Pagas $${amountUSD} USD en lugar de ${amountBSParallel.toFixed(
              2
            )} BS`,
          },
          message: "🎯 Pago directo en USD - Obtienes el mejor precio",
        };
      }

      // Métodos que pagan en BS a tasa oficial (Pago Móvil, Efectivo BS)
      if (method === "PAGO_MOVIL" || method === "CASH_BS") {
        const amountBS = amountUSD * officialRate;

        return {
          amountUSD,
          amountBS: Math.round(amountBS * 100) / 100,
          rate: officialRate,
          savings: null, // No hay ahorro, pagas a tasa oficial
          message: `💸 Pago en BS a tasa oficial: ${officialRate} BS/USD`,
        };
      }

      return {
        amountUSD,
        amountBS: null,
        rate: null,
        savings: null,
        message: "Selecciona un método de pago",
      };
    } catch (error) {
      console.error("❌ Error calculating price:", error);
      throw error;
    }
  }

  static getPaymentMethodInfo(method) {
    const methods = {
      ZELLE: {
        name: "Zelle",
        description: "Pago directo en USD",
        advantage: "Mejor tasa - Sin conversión",
        instructions: "Transfiera directamente en USD",
      },
      CRYPTO: {
        name: "Criptomonedas",
        description: "Pago en cripto (USDT, BTC, etc)",
        advantage: "Mejor tasa - Sin conversión",
        instructions: "Envíe cripto a la dirección proporcionada",
      },
      ZINLI: {
        name: "Zinli",
        description: "Pago con tarjeta Zinli",
        advantage: "Mejor tasa - Sin conversión",
        instructions: "Pague con su tarjeta Zinli",
      },
      PAGO_MOVIL: {
        name: "Pago Móvil",
        description: "Pago en Bolívares",
        advantage: "Conveniente para usuarios locales",
        instructions: "Realice pago móvil con la referencia proporcionada",
      },
      CASH_BS: {
        name: "Efectivo (BS)",
        description: "Pago en efectivo en Bolívares",
        advantage: "Pago en persona",
        instructions: "Pague en efectivo al momento de la entrega",
      },
      CASH_USD: {
        name: "Efectivo (USD)",
        description: "Pago en efectivo en Dólares",
        advantage: "Pago en persona sin conversión",
        instructions: "Pague en efectivo USD al momento de la entrega",
      },
    };

    return methods[method] || {};
  }
}
