import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getUserUploadEvents(userId: string) {
  const entries = await prisma.entry.findMany({
    where: { book: { userId } },
    select: { fromDate: true, toDate: true },
    orderBy: { fromDate: "desc" },
  });

  // Deduplicate date ranges
  const uniqueEvents = Array.from(
    new Map(
      entries.map((e) => [
        `${e.fromDate.toISOString()}_${e.toDate.toISOString()}`,
        e,
      ])
    ).values()
  );

  return uniqueEvents.map((e) => ({
    fromDate: e.fromDate,
    toDate: e.toDate,
  }));
}

export async function getAllUserUploadEvents() {
  const entries = await prisma.entry.findMany({
    select: {
      fromDate: true,
      toDate: true,
      book: {
        select: {
          userId: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
    orderBy: { fromDate: "desc" },
  });

  // Group by userId + deduplicate per user
  const userEventsMap = new Map<
    string,
    {
      userId: string;
      email: string;
      name: string | null;
      events: { fromDate: Date; toDate: Date }[];
    }
  >();

  for (const e of entries) {
    const key = e.book.userId;
    const user = e.book.user;
    const mapEntry = userEventsMap.get(key) ?? {
      userId: key,
      email: user.email,
      name: user.name,
      events: [],
    };

    const eventKey = `${e.fromDate.toISOString()}_${e.toDate.toISOString()}`;
    if (
      !mapEntry.events.some(
        (ev) =>
          `${ev.fromDate.toISOString()}_${ev.toDate.toISOString()}` === eventKey
      )
    ) {
      mapEntry.events.push({ fromDate: e.fromDate, toDate: e.toDate });
    }

    userEventsMap.set(key, mapEntry);
  }

  return Array.from(userEventsMap.values());
}

// GET /api/books
export async function getUserBooks(userId: string) {
  try {
    const books = await prisma.book.findMany({
      where: { userId },
      select: {
        isbn: true,
        name: true,
        // entries: {
        //   select: {
        //     fromDate: true,
        //     toDate: true,
        //     openingStock: true,
        //     printedCopies: true,
        //     soldCopies: true,
        //     returnCopies: true,
        //     mrp: true,
        //     amount: true,
        //     complimentaryDamage: true,
        //     closingStock: true,
        //   },
        //   orderBy: { fromDate: "desc" },
        // },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: books };
  } catch (err) {
    console.error(err);
    return { error: "Failed to fetch books" };
  }
}

// Get all books
export async function getAllBooks() {
  try {
    const books = await prisma.book.findMany({
      select: {
        isbn: true,
        name: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: books };
  } catch (err) {
    console.error(err);
    return { error: "Failed to fetch all books" };
  }
}

export async function getBookEntriesByDateRange(
  userId: string,
  fromDate: Date,
  toDate: Date
) {
  try {
    const entries = await prisma.entry.findMany({
      where: {
        book: { userId },
        fromDate: fromDate,
        toDate: toDate,
      },
      include: {
        book: {
          select: {
            isbn: true,
            name: true,
          },
        },
      },
      orderBy: {
        book: {
          name: "asc",
        },
      },
    });

    // Group entries by book
    const groupedData = entries.reduce((acc, entry) => {
      const isbn = entry.book.isbn;
      if (!acc[isbn]) {
        acc[isbn] = {
          isbn: entry.book.isbn,
          bookName: entry.book.name,
          entries: [],
        };
      }
      acc[isbn].entries.push({
        openingStock: entry.openingStock,
        printedCopies: entry.printedCopies,
        soldCopies: entry.soldCopies,
        returnCopies: entry.returnCopies,
        mrp: entry.mrp,
        amount: entry.amount,
        complimentaryDamage: entry.complimentaryDamage,
        closingStock: entry.closingStock,
        fromDate: entry.fromDate,
        toDate: entry.toDate,
      });
      return acc;
    }, {} as Record<string, any>); // Explicitly type the accumulator

    return { success: true, data: Object.values(groupedData) };
  } catch (error) {
    console.error("Error fetching user data by date range:", error);
    return { error: "Failed to fetch data" };
  }
}
