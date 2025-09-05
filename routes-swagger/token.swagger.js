/**
 * @swagger
 * /token/get:
 *   get:
 *     summary: 토큰 발급(저장 또는 갱신)
 *     description: |
 *       로그인 사용자의 (userId, origin/host) 조합으로 토큰을 발급합니다.
 *       - 기존 레코드가 있으면 **clientToken**만 갱신
 *       - 없으면 **생성**
 *       응답으로 새 토큰을 반환합니다.
 *     tags: [Token]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 발급/갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string, example: "토큰이 발급되었습니다." }
 *                 token:   { type: string }
 *       403: { description: 로그인 필요 }
 *       500: { description: 서버 설정 또는 내부 오류(JWT_SECRET 미설정 등) }
 */
/**
 * @swagger
 * /token/read:
 *   get:
 *     summary: DB에 저장된 토큰 조회 (관리자)
 *     description: 현재 요청의 origin/host와 로그인 사용자(userId) 기준으로 저장된 토큰을 조회합니다.
 *     tags: [Token]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 저장된 토큰 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string, example: "토큰을 성공적으로 불러왔습니다." }
 *                 token:   { type: string }
 *       403: { description: 관리자 권한 필요 }
 *       404: { description: 토큰 레코드 없음 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /token/refresh:
 *   get:
 *     summary: 토큰 재발급(기존 레코드가 있을 때만)
 *     description: 현재 (userId, origin/host) 레코드가 없으면 404를 반환합니다.
 *     tags: [Token]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 재발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string, example: "토큰이 성공적으로 재발급되었습니다." }
 *                 token:   { type: string }
 *       403: { description: 로그인 필요 }
 *       404: { description: 토큰 레코드 없음 }
 *       500: { description: 서버 오류(JWT_SECRET 미설정 등) }
 */
/**
 * @swagger
 * /token/checkTokenStatus:
 *   get:
 *     summary: 토큰 유효성 확인
 *     description: |
 *       **verifyToken** 미들웨어는 `Authorization` 헤더에 **JWT 원문**을 기대합니다.
 *       (Bearer 접두사가 아니라 **토큰 문자열만** 들어가야 함)
 *     tags: [Token]
 *     parameters:
 *       - $ref: '#/components/parameters/AuthorizationHeaderRawJWT'
 *     responses:
 *       200:
 *         description: 유효한 토큰
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string, example: "유효한 토큰입니다." }
 *       401:
 *         description: 유효하지 않은 토큰
 *       419:
 *         description: 토큰 만료
 *       500:
 *         description: 서버 오류
 */
