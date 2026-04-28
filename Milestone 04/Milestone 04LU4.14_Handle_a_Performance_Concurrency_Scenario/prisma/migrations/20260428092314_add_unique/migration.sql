/*
  Warnings:

  - A unique constraint covering the columns `[seatId,showId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Booking_seatId_showId_key" ON "Booking"("seatId", "showId");
