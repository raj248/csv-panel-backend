// user routes to read data
import express, { Request, Response, Router } from "express";
import { verifyAdmin, verifyUser } from "../middleware/auth.middleware";
import {
  getAllBooks,
  getAllUserUploadEvents,
  getBookEntriesByDateRange,
  getUserBooks,
  getUserUploadEvents,
} from "../controllers/user.controller";

const router: Router = express.Router();

router.get(
  "/upload-events",
  verifyUser,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user_token;
      const events = await getUserUploadEvents(userId);
      return res.status(200).json({ success: true, data: events });
    } catch (error) {
      console.error("Error fetching user upload events:", error);
      return res.status(500).json({ error: "Failed to fetch upload events" });
    }
  }
);

router.get("/books", verifyUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user_token;
    const books = await getUserBooks(userId);
    return res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching user books:", error);
    return res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.get(
  "/upload-events/all",
  verifyAdmin,
  async (req: Request, res: Response) => {
    try {
      // Assuming verifyUser middleware already sets req.user_token
      // We need to check if the user is an admin to access all upload events

      const events = await getAllUserUploadEvents();
      return res.status(200).json({ success: true, data: events });
    } catch (error) {
      console.error("Error fetching all user upload events:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch all upload events" });
    }
  }
);

router.get("/books/all", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching all books:", error);
    return res.status(500).json({ error: "Failed to fetch all books" });
  }
});

router.get(
  "/data/:fromDate/:toDate",
  verifyUser,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user_token;
      const { fromDate, toDate } = req.params;

      const result = await getBookEntriesByDateRange(
        userId,
        new Date(fromDate),
        new Date(toDate)
      );

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
      console.error("Error fetching user data by date range:", error);
      return res.status(500).json({ error: "Failed to fetch data" });
    }
  }
);

// router.get(
//   "/data/:fromDate/:toDate",
//   verifyUser,
//   async (req: Request, res: Response) => {
//     try {
//       const userId = (req as any).user_token;
//       const { fromDate, toDate } = req.params;

//       const entries = await prisma.entry.findMany({
//         where: {
//           book: { userId },
//           fromDate: new Date(fromDate),
//           toDate: new Date(toDate),
//         },
//         include: {
//           book: {
//             select: {
//               isbn: true,
//               name: true,
//             },
//           },
//         },
//       });

//       // Group entries by book
//       const groupedData = entries.reduce((acc, entry) => {
//         const isbn = entry.book.isbn;
//         if (!acc[isbn]) {
//           acc[isbn] = {
//             isbn: entry.book.isbn,
//             bookName: entry.book.name,
//             entries: [],
//           };
//         }
//         acc[isbn].entries.push({
//           openingStock: entry.openingStock,
//           printedCopies: entry.printedCopies,
//           soldCopies: entry.soldCopies,
//           returnCopies: entry.returnCopies,
//           mrp: entry.mrp,
//           amount: entry.amount,
//           complimentaryDamage: entry.complimentaryDamage,
//           closingStock: entry.closingStock,
//           fromDate: entry.fromDate,
//           toDate: entry.toDate,
//         });
//         return acc;
//       }, {} as Record<string, any>); // Explicitly type the accumulator

//       return res
//         .status(200)
//         .json({ success: true, data: Object.values(groupedData) });
//     } catch (error) {
//       console.error("Error fetching user data by date range:", error);
//       return res.status(500).json({ error: "Failed to fetch data" });
//     }
//   }
// );

export default router;
