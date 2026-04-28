const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createBooking = async ({ userId, seatId, showId }) => {
  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        seatId,
        showId
      }
    });

    return {
      success: true,
      status: 201,
      data: booking
    };

  } catch (error) {

    // ✅ Handle duplicate booking
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        status: 409,
        message: "Seat already booked for this show"
      };
    }

    // ✅ Handle invalid foreign keys
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        status: 400,
        message: "Invalid userId, seatId, or showId"
      };
    }

    throw error;
  }
};