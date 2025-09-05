/**
 * @swagger
 * /like/me:
 *   get:
 *     summary: 내가 좋아요한 상품 목록
 *     description: 로그인 세션(`isLoggedIn`)이 필요합니다.
 *     tags: [Like]
 *     responses:
 *       200:
 *         description: 좋아요한 상품 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ItemLite' }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /like/ids:
 *   get:
 *     summary: 내가 좋아요한 상품 ID 목록
 *     description: 로그인 세션(`isLoggedIn`)이 필요합니다.
 *     tags: [Like]
 *     responses:
 *       200:
 *         description: 아이디 배열만 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 itemIds:
 *                   type: array
 *                   items: { type: integer }
 *                   example: [1, 4, 7]
 *       403: { description: 로그인 필요 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /like/{itemId}:
 *   post:
 *     summary: 좋아요 토글
 *     description: |
 *       - 이미 좋아요한 상품이면 **삭제**되어 `liked: false` 반환  
 *       - 좋아요하지 않은 상품이면 **생성**되어 `liked: true` 반환  
 *       로그인 세션(`isLoggedIn`)이 필요합니다.
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: integer }
 *         description: 대상 상품 ID
 *     responses:
 *       201:
 *         description: 좋아요 등록됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 liked:   { type: boolean, example: true }
 *       200:
 *         description: 좋아요 해제됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 liked:   { type: boolean, example: false }
 *       400: { description: 유효하지 않은 itemId }
 *       403: { description: 로그인 필요 }
 *       500: { description: 서버 오류 }
 */