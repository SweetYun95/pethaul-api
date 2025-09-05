/**
 * @swagger
 * /contents:
 *   get:
 *     summary: 콘텐츠 목록 조회
 *     description: 공개(published) 상태의 콘텐츠만 조회합니다. 태그/검색/페이징 지원.
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *         required: false
 *         description: 페이지 (기본 1)
 *       - in: query
 *         name: size
 *         schema: { type: integer, example: 10 }
 *         required: false
 *         description: 페이지당 개수 (기본 10, 최대 50)
 *       - in: query
 *         name: tag
 *         schema: { type: string, example: "GUIDE" }
 *         required: false
 *         description: 태그 필터
 *       - in: query
 *         name: q
 *         schema: { type: string, example: "산책" }
 *         required: false
 *         description: 제목/요약 텍스트 검색
 *     responses:
 *       200:
 *         description: 콘텐츠 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Content'
 *                 page:  { type: integer, example: 1 }
 *                 size:  { type: integer, example: 10 }
 *                 total: { type: integer, example: 124 }
 *                 hasMore: { type: boolean, example: true }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /contents/{id}:
 *   get:
 *     summary: 콘텐츠 상세 조회 (ID)
 *     description: 공개(published) 상태의 콘텐츠만 반환합니다.
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 101 }
 *         description: 콘텐츠 ID
 *     responses:
 *       200:
 *         description: 콘텐츠 상세
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       404: { description: Not found }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /contents/slug/{slug}:
 *   get:
 *     summary: 콘텐츠 상세 조회 (슬러그)
 *     description: 공개(published) 상태의 콘텐츠만 반환합니다.
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string, example: "puppy-walk-guide" }
 *         description: 슬러그
 *     responses:
 *       200:
 *         description: 콘텐츠 상세
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       404: { description: Not found }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /contents:
 *   post:
 *     summary: 콘텐츠 생성 (관리자)
 *     description: 관리자 권한 필요(`verifyToken`, `isAdmin`). status 미지정 시 published로 처리되며, published일 경우 publishedAt 자동 세팅.
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, summary]
 *             properties:
 *               title:       { type: string, example: "강아지 산책 가이드" }
 *               summary:     { type: string, example: "처음 산책 시 유의사항 정리" }
 *               body:        { type: string, example: "<p>HTML 또는 마크다운 본문</p>" }
 *               tag:         { type: string, example: "GUIDE" }
 *               slug:        { type: string, example: "puppy-walk-guide" }
 *               coverUrl:    { type: string, example: "https://.../cover.jpg" }
 *               thumbUrl:    { type: string, example: "https://.../thumb.jpg" }
 *               isFeatured:  { type: boolean, example: true }
 *               status:      { type: string, enum: [draft, published], example: "published" }
 *               publishedAt: { type: string, format: date-time }
 *               authorId:    { type: integer, example: 7, description: 미지정 시 토큰 사용자 id로 자동 세팅될 수 있음 }
 *               author:      { type: string, example: "홍길동", description: 미지정 시 토큰 사용자 name으로 자동 세팅될 수 있음 }
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /contents/{id}:
 *   put:
 *     summary: 콘텐츠 수정 (관리자)
 *     description: 관리자 권한 필요(`verifyToken`, `isAdmin`). status가 published가 되면 publishedAt 자동 세팅.
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 101 }
 *         description: 수정할 콘텐츠 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:       { type: string }
 *               summary:     { type: string }
 *               body:        { type: string }
 *               tag:         { type: string, example: "GUIDE" }
 *               slug:        { type: string }
 *               coverUrl:    { type: string }
 *               thumbUrl:    { type: string }
 *               isFeatured:  { type: boolean }
 *               status:      { type: string, enum: [draft, published] }
 *               publishedAt: { type: string, format: date-time }
 *               authorId:    { type: integer, nullable: true }
 *               author:      { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       404: { description: Not found }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /contents/{id}:
 *   delete:
 *     summary: 콘텐츠 삭제 (관리자)
 *     description: 관리자 권한 필요(`verifyToken`, `isAdmin`).
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 101 }
 *         description: 삭제할 콘텐츠 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       404: { description: Not found }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /contents/images:
 *   post:
 *     summary: 콘텐츠 이미지 업로드 (관리자)
 *     description: 관리자 권한 필요(`verifyToken`, `isAdmin`). 업로드된 파일의 접근 URL을 반환합니다.
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *     responses:
 *       201:
 *         description: 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url: { type: string, example: "https://example.com/uploads/cover-1693920000.jpg" }
 *       400: { description: No file uploaded }
 *       500: { description: 서버 오류 }
 */