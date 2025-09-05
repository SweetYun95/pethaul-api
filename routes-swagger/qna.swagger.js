/**
 * @swagger
 * /qna:
 *   get:
 *     summary: 문의글 전체 조회
 *     description:
 *       role이 'ADMIN'이면 전체 문의를, 그렇지 않으면 쿼리의 id(=userId)에 해당하는 사용자의 문의만 조회합니다.
 *     tags: [QnA]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 7 }
 *         description: 사용자 ID (관리자가 전체 조회 시에도 필수로 받고 있음)
 *       - in: query
 *         name: role
 *         required: false
 *         schema: { type: string, example: "ADMIN" }
 *         description: ADMIN이면 전체 조회, 그 외에는 해당 사용자(id)만 조회
 *     responses:
 *       200:
 *         description: 문의글 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 15 }
 *                       title: { type: string, example: "배송 관련 문의" }
 *                       content: { type: string, example: "언제 배송되나요?" }
 *                       comment: { type: string, nullable: true, example: "오늘 출고 예정입니다." }
 *                       userId: { type: integer, example: 7 }
 *                       createdAt: { type: string, format: date-time }
 *                       updatedAt: { type: string, format: date-time }
 *                       User:
 *                         type: object
 *                         properties:
 *                           id: { type: integer, example: 7 }
 *                           userId: { type: string, example: "pethaul_user01" }
 *                           name: { type: string, example: "홍길동" }
 *       404: { description: 회원 정보를 찾을 수 없습니다. }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /qna/{id}:
 *   get:
 *     summary: 문의글 상세 조회
 *     tags: [QnA]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 15 }
 *         description: 조회할 문의글 ID
 *     responses:
 *       200:
 *         description: 문의글 상세
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qna:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 15 }
 *                     title: { type: string, example: "배송 관련 문의" }
 *                     content: { type: string, example: "언제 배송되나요?" }
 *                     comment: { type: string, nullable: true, example: "오늘 출고 예정입니다." }
 *                     userId: { type: integer, example: 7 }
 *                     createdAt: { type: string, format: date-time }
 *                     updatedAt: { type: string, format: date-time }
 *                     User:
 *                       type: object
 *                       properties:
 *                         id: { type: integer, example: 7 }
 *                         userId: { type: string, example: "pethaul_user01" }
 *                         name: { type: string, example: "홍길동" }
 *       404: { description: 해당 문의 데이터를 찾을 수 없습니다. }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /qna:
 *   post:
 *     summary: 문의글 작성
 *     description: 로그인 세션 필요(코드상 req.user.id 사용).
 *     tags: [QnA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:   { type: string, example: "배송 관련 문의" }
 *               content: { type: string, example: "언제 배송되나요?" }
 *     responses:
 *       201:
 *         description: 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "문의가 성공적으로 등록되었습니다." }
 *                 qna:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 16 }
 *                     title: { type: string, example: "배송 관련 문의" }
 *                     content: { type: string, example: "언제 배송되나요?" }
 *                     userId: { type: integer, example: 7 }
 *                     createdAt: { type: string, format: date-time }
 *                     updatedAt: { type: string, format: date-time }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /qna/edit/{id}:
 *   put:
 *     summary: 문의글 수정
 *     description: (현재 코드상 본인 확인 미포함) 제목/내용을 수정합니다.
 *     tags: [QnA]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 15 }
 *         description: 수정할 문의글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:   { type: string, example: "배송 관련 문의(수정)" }
 *               content: { type: string, example: "배송 예정일이 궁금합니다." }
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "문의가 성공적으로 수정되었습니다." }
 *       404: { description: 해당 게시글을 찾을 수 없습니다. }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /qna/{id}:
 *   delete:
 *     summary: 문의글 삭제
 *     description:
 *       USER 권한 사용자는 자신의 글만 삭제 가능. (코드에서 `req.user.role === 'USER'` 체크)
 *     tags: [QnA]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 15 }
 *         description: 삭제할 문의글 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "문의글을 삭제했습니다." }
 *       403: { description: 권한이 없습니다. }
 *       404: { description: 해당 게시글을 찾을 수 없습니다. }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /qna/comment/{id}:
 *   patch:
 *     summary: (관리자) 문의글에 답글 달기
 *     description: 관리자 권한 필요. `comment` 필드로 답글을 저장합니다.
 *     tags: [QnA]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 15 }
 *         description: 답글을 달 문의글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment: { type: string, example: "오늘 출고 예정입니다." }
 *     responses:
 *       200:
 *         description: 답글 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "문의에 답글을 작성했습니다." }
 *       404: { description: 해당 문의글을 찾을 수 없습니다. }
 *       500: { description: 서버 오류 }
 */
