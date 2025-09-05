/**
 * @swagger
 * /auth/join:
 *   post:
 *     summary: 사용자 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - email
 *               - name
 *               - password
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 아이디
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일
 *               name:
 *                 type: string
 *                 description: 이름
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 비밀번호
 *               address:
 *                 type: string
 *                 description: 주소
 *               phoneNumber:
 *                 type: string
 *                 description: 전화번호
 *               gender:
 *                 type: string
 *                 description: 성별 (M/F)
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       409:
 *         description: 이미 존재하는 사용자
 *       500:
 *         description: 서버 오류
 */
/**
 * @swagger
 * /auth/check-username:
 *   post:
 *     summary: 아이디 중복 확인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, description: 중복 체크할 아이디 }
 *     responses:
 *       200: { description: 사용 가능 }
 *       409: { description: 이미 사용 중 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /auth/check-email:
 *   post:
 *     summary: 이메일 중복 확인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: 사용 가능 }
 *       409: { description: 이미 사용 중 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - password
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 아이디
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       400:
 *         description: 요청값 오류 (아이디 또는 비밀번호 누락)
 *       401:
 *         description: 인증 실패 (아이디 또는 비밀번호 불일치)
 *       500:
 *         description: 서버 오류
 */
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 사용자 로그아웃
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       403:
 *         description: 로그인 필요
 */
/**
 * @swagger
 * /auth/check:
 *   get:
 *     summary: 로그인 상태 확인
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그인 상태 반환
 */
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: 구글 로그인 시작
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 구글 인증 페이지로 리다이렉트
 */
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: 구글 로그인 콜백
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 로그인 성공 시 프론트엔드로 리다이렉트
 */
/**
 * @swagger
 * /auth/googlecheck:
 *   get:
 *     summary: 구글 로그인 상태 확인
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 구글 로그인 여부 반환
 */
/**
 * @swagger
 * /auth/findid:
 *   post:
 *     summary: 핸드폰 번호로 아이디 찾기
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber]
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: ID 조회 성공
 *       404:
 *         description: 해당 정보 없음
 */
/**
 * @swagger
 * /auth/updatepw:
 *   post:
 *     summary: 임시 비밀번호 발급
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, phoneNumber]
 *             properties:
 *               userId:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: 임시 비밀번호 발급 성공
 *       404:
 *         description: 일치하는 회원 없음
 */
/**
 * @swagger
 * /auth:
 *   put:
 *     summary: 회원 정보 수정
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phoneNumber: { type: string }
 *               address: { type: string }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200:
 *         description: 회원 정보 수정 성공
 *       404:
 *         description: 회원 없음
 */
/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: 비밀번호 확인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: 비밀번호 일치
 *       401:
 *         description: 불일치
 */
