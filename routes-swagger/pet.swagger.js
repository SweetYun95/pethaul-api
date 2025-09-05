/**
 * @swagger
 * /pet:
 *   get:
 *     summary: 내 펫 목록 조회 (이미지 포함)
 *     description: 로그인 세션(`isLoggedIn`) 필요
 *     tags: [Pet]
 *     responses:
 *       200:
 *         description: 내 펫 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "회원이 등록한 펫 목록을 성공적으로 불러왔습니다." }
 *                 pets:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PetWithImages' }
 *       403: { description: 로그인 필요 }
 *       500: { description: 서버 오류 }
 *
 *   post:
 *     summary: 펫 등록 (이미지 포함)
 *     description: 로그인 세션(`isLoggedIn`) 필요
 *     tags: [Pet]
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreatePetFormData'
 *     responses:
 *       201:
 *         description: 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:   { type: boolean, example: true }
 *                 message:   { type: string, example: "펫이 성공적으로 등록되었습니다." }
 *                 pet:       { $ref: '#/components/schemas/Pet' }
 *                 petImages:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PetImage' }
 *       400: { description: 필수 값 누락(petName, petType) }
 *       403: { description: 로그인 필요 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /pet/edit/{id}:
 *   put:
 *     summary: 펫 수정 (이미지 재업로드 시 기존 이미지 전부 교체)
 *     description: 로그인 세션(`isLoggedIn`) 필요. 작성자 본인만 수정 가능.
 *     tags: [Pet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *         description: 수정할 펫 ID
 *     requestBody:
 *       $ref: '#/components/requestBodies/UpdatePetFormData'
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "펫 정보를 성공적으로 수정했습니다." }
 *       403: { description: 권한 없음(본인 아님) 또는 로그인 필요 }
 *       404: { description: 해당 펫 없음 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /pet/{id}:
 *   delete:
 *     summary: 펫 삭제
 *     description: 로그인 세션(`isLoggedIn`) 필요. 작성자 본인만 삭제 가능.
 *     tags: [Pet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *         description: 삭제할 펫 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "펫이 삭제되었습니다." }
 *       403: { description: 권한 없음(본인 아님) 또는 로그인 필요 }
 *       404: { description: 해당 펫 없음 }
 *       500: { description: 서버 오류 }
 */
/**
 * @swagger
 * /pet:
 *   get:
 *     summary: 회원이 등록한 펫 목록 조회 (이미지 포함)
 *     description: 로그인 세션(`isLoggedIn`) 필요. 현재 로그인한 사용자가 등록한 펫 목록을 반환합니다.
 *     tags: [Pet]
 *     responses:
 *       200:
 *         description: 내 펫 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "회원이 등록한 펫 목록을 성공적으로 불러왔습니다." }
 *                 pets:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PetWithImages' }
 *       403: { description: 로그인 필요 }
 *       500: { description: 서버 오류 }
 */
