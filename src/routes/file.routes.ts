import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import csvParser from "csv-parser";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { email: userEmail, fromDate, toDate } = req.body;
    const filePath = req.file.path;

    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      if (!user) return res.status(404).json({ error: "User not found" });

      const results: any[] = [];

      // Parse CSV
      fs.createReadStream(filePath)
        .pipe(csvParser({ skipLines: 3 }))
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          fs.unlinkSync(filePath); // cleanup

          for (const row of results) {
            const isbn = row["isbn no."]?.trim();
            const bookName = row["Book Name"]?.trim();

            if (!isbn || !bookName) continue; // skip invalid rows

            // 1️⃣ Check if book exists for this user
            let book = await prisma.book.findUnique({
              where: { isbn },
            });

            // 2️⃣ If not, create it
            if (!book) {
              book = await prisma.book.create({
                data: {
                  isbn,
                  name: bookName,
                  userId: user.id,
                },
              });
            }

            // 3️⃣ Create entry for this book
            await prisma.entry.create({
              data: {
                bookId: book.id,
                openingStock: parseInt(row["Opening Stock"] || "0"),
                printedCopies: parseInt(row["Printed Copies"] || "0"),
                soldCopies: parseInt(row["Sold Copies"] || "0"),
                returnCopies: parseInt(row["Return Copies"] || "0"),
                mrp: parseFloat(row["MRP (INR)"] || "0"),
                amount: parseFloat(row["Amount (INR)"] || "0"),
                complimentaryDamage: parseInt(
                  row["Complimentary/Damage"] || "0"
                ),
                closingStock: parseInt(row["Closing Stock"] || "0"),
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
              },
            });
          }

          res.json({ success: true, message: "CSV processed successfully" });
        });
    } catch (err) {
      console.error(err);
      fs.unlinkSync(filePath);
      res.status(500).json({ error: "Failed to process CSV" });
    }
  }
);

export default router;
