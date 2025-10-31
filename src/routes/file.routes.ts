// src/routes/file.routes.ts
import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import csvParser from "csv-parser";
import { parseStringPromise } from "xml2js";

const router = express.Router();

// store files in memory or temp folder
const upload = multer({ dest: "uploads/" });

// Accept a single file: csv or xml
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    try {
      if (originalName.endsWith(".csv")) {
        const results: any[] = [];
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (data) => results.push(data))
          .on("end", () => {
            console.log("CSV Data:", results);
            fs.unlinkSync(filePath); // clean up
            res.json({ success: true, data: results });
          });
      } else if (originalName.endsWith(".xml")) {
        const xmlData = fs.readFileSync(filePath, "utf-8");
        const jsonData = await parseStringPromise(xmlData);
        console.log("XML Data:", jsonData);
        fs.unlinkSync(filePath); // clean up
        res.json({ success: true, data: jsonData });
      } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Invalid file type" });
      }
    } catch (err) {
      console.error(err);
      fs.unlinkSync(filePath);
      res.status(500).json({ error: "Failed to process file" });
    }
  }
);

export default router;
