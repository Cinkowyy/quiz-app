import { PrismaClient } from "@prisma/client";
import { JwtInfo } from "./jwtInfo";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dayjs from "dayjs";
import ms from "ms";

export function getTokens({
  userId,
  jwtInfo,
  session,
}: {
  userId: string;
  jwtInfo: JwtInfo;
  session: {
    id: string;
    secret: string;
  };
}) {
  const accessToken = jwt.sign(
    {
      sub: userId,
    },
    jwtInfo.secret,
    {
      expiresIn: jwtInfo.timeout,
    }
  );

  const refreshToken = jwt.sign(
    {
      sub: userId,
      jti: session.id,
    },
    session.secret,
    {
      expiresIn: jwtInfo.refreshTokenTimeout,
    }
  );

  return {
    accessToken,
    refreshToken,
  };
}

export async function createSession({
  prisma,
  userId,
  jwtInfo,
}: {
  prisma: PrismaClient;
  userId: string;
  jwtInfo: JwtInfo;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const session = await prisma.sessions.create({
    data: {
      userId,
      secret: crypto.randomBytes(32).toString("hex"),
      expiresAt: dayjs()
        .add(ms(jwtInfo.refreshTokenTimeout), "millisecond")
        .toDate(),
    },
  });

  return getTokens({
    userId,
    session,
    jwtInfo,
  });
}
