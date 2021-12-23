-- CreateTable
CREATE TABLE "Chain" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_l1" BOOLEAN NOT NULL DEFAULT false,
    "is_testnet" BOOLEAN NOT NULL DEFAULT false,
    "is_sending_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_receiving_enabled" BOOLEAN NOT NULL DEFAULT false,
    "token_id" INTEGER NOT NULL,
    "explorers" TEXT[],

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "decimals" INTEGER NOT NULL,
    "symbol" VARCHAR(255) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChainsOnTokens" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "token_id" INTEGER NOT NULL,

    CONSTRAINT "ChainsOnTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bridge" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "is_testnet" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Bridge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BridgesOnTokens" (
    "id" SERIAL NOT NULL,
    "bridge_id" INTEGER NOT NULL,
    "token_id" INTEGER NOT NULL,

    CONSTRAINT "BridgesOnTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_claimable" BOOLEAN NOT NULL DEFAULT false,
    "chain_from_id" INTEGER NOT NULL,
    "chain_to_id" INTEGER NOT NULL,
    "bridge_id" INTEGER NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chain_chainId_key" ON "Chain"("chainId");

-- AddForeignKey
ALTER TABLE "Chain" ADD CONSTRAINT "Chain_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainsOnTokens" ADD CONSTRAINT "ChainsOnTokens_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChainsOnTokens" ADD CONSTRAINT "ChainsOnTokens_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BridgesOnTokens" ADD CONSTRAINT "BridgesOnTokens_bridge_id_fkey" FOREIGN KEY ("bridge_id") REFERENCES "Bridge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BridgesOnTokens" ADD CONSTRAINT "BridgesOnTokens_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_chain_from_id_fkey" FOREIGN KEY ("chain_from_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_chain_to_id_fkey" FOREIGN KEY ("chain_to_id") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_bridge_id_fkey" FOREIGN KEY ("bridge_id") REFERENCES "Bridge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
