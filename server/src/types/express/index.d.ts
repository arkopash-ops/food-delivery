import type { UserDocument } from "../../model/user.model.ts";

declare module "express-serve-static-core" {
    interface Request {
        user?: UserDocument;
    }
}

export { };
