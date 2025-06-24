const express = require('express');
const router = express.Router();
const createUploadMiddleware = require('../middlewares/upload-multimedia');
const verifyToken = require('../middlewares/jwt-auth');
const upload = createUploadMiddleware('profile_pictures');

const { 
    getUserById,
    updateUser,
    disableUser,
    updateUserProfilePicture,
    updateUserPassword,


    followUser,
    unfollowUser,
    getFollowersByUserId,
    getProfilePicture
 } = require('../controllers/users');

/**
 * @swagger
 * /api/users/{_id}:
 *  get:
 *     summary: Obtener un usuario por su ID
 *     tags: [Users]
 *     description: Recupera la información de un usuario específico.
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: El ID del usuario a obtener.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Juan Perez"
 *                 email:
 *                   type: string
 *                   example: "juan@gmail.com"
 *                 profilePicture:
 *                   type: string
 *                   example: "https://i.imgur.com/WxNkK7J.png"
 *                 role:
 *                   type: string
 *                   example: "user"
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno al obtener el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/:_id', getUserById);


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     description: Recupera la lista de todos los usuarios registrados.
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  type: object
 *                  properties:
 *                      name:
 *                        type: string
 *                        example: "Juan Perez"
 *                      email:
 *                        type: string
 *                        example: "juan@gmail.com"
 *                      profilePicture:
 *                        type: string
 *                        example: "https://i.imgur.com/WxNkK7J.png"
 *                      role:
 *                        type: string
 *                        example: "user"
 * 
 *       500:
 *         description: Error interno al obtener los usuarios
 */
//router.get('/', verifyToken, getUsers);

/**
 * @swagger
 * /api/users/{_id}:
 *   put:
 *     summary: Actualizar los datos de un usuario
 *     tags: [Users]
 *     description: Actualiza los datos del usuario especificado por el ID.
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: El ID del usuario a actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  type: object
 *                  properties:
 *                      name:
 *                        type: string
 *                        example: "Juan Perez"
 *                      email:
 *                        type: string
 *                        example: "juan@gmail.com"
 *                      profilePicture:
 *                        type: string
 *                        example: "https://i.imgur.com/WxNkK7J.png"
 *                      role:
 *                        type: string
 *                        example: "user"
 *       400:
 *         description: El correo electrónico ya está registrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno al actualizar el usuario
 */
router.put('/:_id', verifyToken, updateUser);

/**
 * @swagger
 * /api/users/{_id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Users]
 *     description: Elimina un usuario especificado por su ID.
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: El ID del usuario a eliminar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  type: object
 *                  properties:
 *                      name:
 *                        type: string
 *                        example: "Juan Perez"
 *                      email:
 *                        type: string
 *                        example: "juan@gmail.com"
 *                      profilePicture:
 *                        type: string
 *                        example: "https://i.imgur.com/WxNkK7J.png"
 *                      role:
 *                        type: string
 *                        example: "user"
 *       400:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno al eliminar el usuario
 */
router.put('/:_id', verifyToken, disableUser);

/**
 * @swagger
 * /api/users/{_id}/profile_picture:
 *   put:
 *     summary: Actualizar la foto de perfil de un usuario
 *     tags: [Users]
 *     description: Permite al usuario actualizar su foto de perfil.
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: El ID del usuario cuyo perfil se actualizará.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile-picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto de perfil actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  type: object
 *                  properties:
 *                      name:
 *                        type: string
 *                        example: "Juan Perez"
 *                      email:
 *                        type: string
 *                        example: "juan@gmail.com"
 *                      profilePicture:
 *                        type: string
 *                        example: "https://i.imgur.com/WxNkK7J.png"
 *                      role:
 *                        type: string
 *                        example: "user"
 *       404:
 *         description: Usuario no encontrado o no se ha enviado una imagen
 *       500:
 *         description: Error interno al actualizar la foto de perfil
 */
router.put('/:_id/profile-picture', verifyToken, upload.single('profilePicture'), updateUserProfilePicture);

/**
 * @swagger
 * /api/users/{_id}/password:
 *   put:
 *     summary: Actualizar la contraseña de un usuario
 *     tags: [Users]
 *     description: Permite al usuario actualizar su contraseña.
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: El ID del usuario cuya contraseña se actualizará.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: La nueva contraseña del usuario
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  type: object
 *                  properties:
 *                      name:
 *                        type: string
 *                        example: "Juan Perez"
 *                      email:
 *                        type: string
 *                        example: "juan@gmail.com"
 *                      profilePicture:
 *                        type: string
 *                        example: "https://i.imgur.com/WxNkK7J.png"
 *                      role:
 *                        type: string
 *                        example: "user"
 *       400:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno al actualizar la contraseña
 */
router.put('/:_id/password', verifyToken, updateUserPassword);

/**
 * @swagger
 * /api/users/{_id}/unfollow:
 *   put:
 *     summary: Dejar de seguir a un usuario
 *     tags: [Users]
 *     description: Permite al usuario actual dejar de seguir a otro usuario especificado por el ID.
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: ID del usuario al que se desea dejar de seguir.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followerId:
 *                 type: string
 *                 description: ID del usuario que deja de seguir.
 *                 example: "6650e07199e65b9a589d1522"
 *     responses:
 *       200:
 *         description: Usuario dejado de seguir exitosamente.
 *       400:
 *         description: El usuario no está siguiendo al usuario especificado o datos inválidos.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno al dejar de seguir al usuario.
 */
router.put('/:_id/unfollow', unfollowUser);

/**
 * @swagger
 * /api/users/{_id}/follow:
 *   put:
 *     summary: Seguir a un usuario
 *     tags: [Users]
 *     description: Permite al usuario actual seguir a otro usuario especificado por el ID.
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: ID del usuario que se desea seguir.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followerId:
 *                 type: string
 *                 description: ID del usuario que está siguiendo.
 *                 example: "6650e07199e65b9a589d1522"
 *     responses:
 *       200:
 *         description: Usuario seguido exitosamente.
 *       400:
 *         description: El usuario ya sigue a este usuario o datos inválidos.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno al seguir al usuario.
 */

router.put('/:_id/follow', followUser);

/**
 * @swagger
 * /api/users/{_id}/followers:
 *   get:
 *     summary: Obtener los seguidores de un usuario
 *     tags: [Users]
 *     description: Recupera la lista de usuarios que siguen al usuario especificado por su ID.
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: ID del usuario cuyos seguidores se desean obtener.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de seguidores obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "6650e07199e65b9a589d1522"
 *                   name:
 *                     type: string
 *                     example: "María López"
 *                   email:
 *                     type: string
 *                     example: "maria@gmail.com"
 *                   profilePicture:
 *                     type: string
 *                     example: "https://i.imgur.com/example.png"
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno al obtener los seguidores.
 */
router.get('/:_id/followers', getFollowersByUserId)

/**
 * @swagger
 * /api/users/{_id}/profile-picture:
 *   get:
 *     summary: Obtener la imagen de perfil del usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Imagen devuelta correctamente
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error interno
 */
router.get('/:_id/profile-picture', verifyToken, getProfilePicture);



module.exports = router;
