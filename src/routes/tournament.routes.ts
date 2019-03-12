import * as express from "express";
import { UserData } from "../models/authentication.model";
import { passwords } from "../passwords";
import { tournamentModel } from "../models/tournament.model";
import { validators } from "./validators";

const router = express.Router();

router.post(
    "/createTeam",
    passwords.authorize,
    validators.requiredAttributes(["teamName"]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            res.json(await tournamentModel.createTeam(user, req.body.teamName));
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    "/joinTeam",
    passwords.authorize,
    validators.requiredAttributes(["joinCode"]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            res.json(await tournamentModel.joinTeam(user, req.body.joinCode));
        } catch (e) {
            next(e);
        }
    }
);


router.post(
    "/exitTeam",
    passwords.authorize,
    validators.requiredAttributes(["joinCode"]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            await tournamentModel.exitTeam(user)
            res.json({message: 'done'});
        } catch (e) {
            next(e);
        }
    }
)

router.post(
    "/dissolveTeam",
    passwords.authorize,
    validators.requiredAttributes(["joinCode"]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            await tournamentModel.dissolveTeam(user)
            res.json({message: 'done'});
        } catch (e) {
            next(e);
        }
    }
)

router.get(
    "/teamInfo",
    passwords.authorize,
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            res.json(await tournamentModel.getTeamInformation(user));
        } catch (e) {
            next(e);
        }
    }
);

export const tournamentRouter = router;
