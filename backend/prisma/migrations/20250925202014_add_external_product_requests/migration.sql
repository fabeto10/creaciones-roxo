-- CreateTable
CREATE TABLE "external_product_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerContact" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "budget" REAL,
    "dueDate" DATETIME,
    "notes" TEXT,
    "images" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
