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
