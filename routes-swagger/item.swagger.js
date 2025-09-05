/**
 * @swagger
 * /item:
 *   post:
 *     summary: 상품 등록 (관리자)
 *     tags: [Item]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateItemFormData'
 *     responses:
 *       201:
 *         description: 상품 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 item:    { $ref: '#/components/schemas/Item' }
 *                 images:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ItemImage' }
 *                 categories:
 *                   type: array
 *                   items: { type: string }
 *       400: { description: 파일 누락/카테고리 파싱 실패 등 유효성 오류 }
 *       403: { description: 권한 없음 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 *   get:
 *     summary: 상품 목록 조회 (검색/카테고리/페이지네이션)
 *     description: '인증 토큰 필요(verifyToken). 카테고리는 단일/다중 모두 지원: sellCategory=Dog&sellCategory=Food 또는 sellCategory[]=Dog&sellCategory[]=Food'
 *     tags: [Item]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: searchTerm
 *         schema: { type: string }
 *         description: 상품명 검색
 *       - in: query
 *         name: sellCategory
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items: { type: string }
 *         description: 카테고리명(복수 가능)
 *     responses:
 *       200:
 *         description: 상품 목록 페이징 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean }
 *                 message:  { type: string }
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Item' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:  { type: integer }
 *                     totalPages:  { type: integer }
 *                     currentPage: { type: integer }
 *                     limit:       { type: integer }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /item/all/main:
 *   get:
 *     summary: 메인 노출용 상품 묶음 조회(전체 판매량, 오늘 주문, 최신 등록)
 *     tags: [Item]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         description: 각 섹션 당 최대 개수
 *     responses:
 *       200:
 *         description: 섹션별 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topSales:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Item' }
 *                 topToday:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Item' }
 *                 newItems:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Item' }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /item/{id}:
 *   get:
 *     summary: 특정 상품 상세 조회
 *     description: '인증 토큰 필요(verifyToken). 리뷰/이미지/카테고리 포함'
 *     tags: [Item]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 상품 상세
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 item:    { $ref: '#/components/schemas/Item' }
 *       404: { description: 상품 없음 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /item/{id}:
 * @swagger
 *   put:
 *     summary: 상품 수정 (관리자)
 *     tags: [Item]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       $ref: '#/components/requestBodies/UpdateItemFormData'
 *     responses:
 *       200: { description: 수정 성공 }
 *       400: { description: 카테고리 파싱 실패 등 유효성 오류 }
 *       404: { description: 상품 없음 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /item/{id}:
 *   delete:
 *     summary: 상품 삭제 (관리자)
 *     tags: [Item]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 삭제 성공 }
 *       404: { description: 상품 없음 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /item/recommend:
 *   post:
 *     summary: 추천 상품 조회(ALS 등 외부 추천 결과 아이디 배열로 받아 상세 조회)
 *     tags: [Item]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items: { type: integer }
 *     responses:
 *       200:
 *         description: 추천 상품 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:      { type: integer }
 *                       itemNm:  { type: string }
 *                       price:   { type: integer }
 *                       ItemImages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             oriImgName: { type: string }
 *                             imgUrl:     { type: string }
 *       204: { description: 추천할 상품 없음(items 비어있음) }
 *       500: { description: 서버 오류 }
 */