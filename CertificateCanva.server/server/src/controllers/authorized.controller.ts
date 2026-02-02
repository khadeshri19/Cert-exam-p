import { Request, Response, NextFunction } from 'express';
import * as authorizedService from '../services/authorized.service';

// GET /api/authorized/:id - Public verification (no login required)
export const getAuthorizedCertificate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const result = await authorizedService.getAuthorizedCertificate(id);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
