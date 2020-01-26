import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";

function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void
): void {
  const allowedTypes = /jpeg|jpg|png/;
  const fileExt = path.extname(file.originalname.toLowerCase());
  const extAllowed = allowedTypes.test(fileExt);
  const mimeAllowed = allowedTypes.test(file.mimetype);
  if (extAllowed && mimeAllowed) {
    return callback(null, true);
  }
  return callback(new Error("Only PNG and JPEG is allowed"), false);
}

const storage = multer.diskStorage({
  destination: "./public/avatars/",
  filename(req: Request, file, callback) {
    const fileExt = path.extname(file.originalname.toLowerCase());
    const fileName = path.basename(file.originalname.toLowerCase(), fileExt);
    callback(null, `${fileName}${fileExt}`);
  }
});
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5000000
  }
}).single("avatar");

export default (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, err => {
    if (err) {
      // @ts-ignore
      if (err instanceof multer.MulterError) {
        return res.status(400).send(err.message);
      }
      return next(err);
    }
    return next();
  });
};
