/**
 * @swagger
 * /cart/{id}:
 *   get:
 *     summary: 장바구니 조회
 *     description: |
 *       로그인한 사용자의 장바구니 항목을 반환합니다.
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: (무시됨) 문서 일관성을 위한 placeholder
 *     responses:
 *       200:
 *         description: 장바구니 항목 배열
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *       403: { description: 로그인 필요 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: 장바구니에 상품 추가
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *     responses:
 *       200:
 *         description: 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       400: { description: 유효하지 않은 요청(itemId, count) }
 *       403: { description: 로그인 필요 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /cart/update/{itemId}:
 *   put:
 *     summary: 장바구니 상품 수량 수정
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: integer }
 *         description: 수정할 상품 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartCountRequest'
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       400: { description: count는 양의 정수여야 함 }
 *       403: { description: 로그인 필요 }
 *       404: { description: 장바구니 또는 항목을 찾을 수 없음 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /cart/delete/{itemId}:
 *   delete:
 *     summary: 장바구니 항목 삭제
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: integer }
 *         description: 삭제할 상품 ID
 *     responses:
 *       200:
 *         description: 삭제 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       403: { description: 로그인 필요 }
 *       404: { description: 장바구니 또는 항목 없음 }
 *       500: { description: 서버 오류 }
 */